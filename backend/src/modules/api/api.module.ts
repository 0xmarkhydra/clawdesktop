import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { QueueModule } from '@/queue/queue.module';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { configAuth } from './configs/auth';
import { configCache } from './configs/cache';
import { HttpCacheInterceptor } from './interceptors';
import { BusinessModule } from '@/business/business.module';
import { WebSocketModule } from '../websocket/websocket.module';

// Controllers
import { HealthController } from './controllers/health.controller';
import { AuthController } from './controllers/auth.controller';
import { ThreadController } from './controllers/thread.controller';
import { AdminController } from './controllers/admin.controller';

// Upload
import { UploadModule } from '@/upload/upload.module';

// Services
import { AuthService } from './services/auth.service';
import { ThreadService } from './services/thread.service';
import { TelegramService } from './services/telegram.service';
import { GeminiService } from '@/business/services/gemini.service';
import { KnowledgeService } from '@/business/services/knowledge.service';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { UserRepository, ThreadRepository, MessageRepository } from '@/database/repositories';

const controllers = [HealthController, AuthController, ThreadController, AdminController];
const services = [AuthService, ThreadService, TelegramService];

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: process.env.APP_ENV === 'production' ? 60 : 600,
    }),
    DatabaseModule,
    QueueModule,
    BusinessModule,
    WebSocketModule,
    UploadModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        try {
          let urlRedis: string;

          if (process.env.REDIS_URL) {
            urlRedis = process.env.REDIS_URL;
            const url = new URL(urlRedis);
            if (process.env.REDIS_FAMILY) {
              url.searchParams.set('family', process.env.REDIS_FAMILY);
              urlRedis = url.toString();
            }
          } else {
            urlRedis = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DATABASE || 0}?family=${process.env.REDIS_FAMILY || 0}`;
            if (process.env.REDIS_PASSWORD) {
              const username = process.env.REDIS_USERNAME || '';
              urlRedis = `redis://${username}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DATABASE || 0}?family=${process.env.REDIS_FAMILY || 0}`;
            }
          }

          const store = await redisStore({
            url: urlRedis,
            ttl: Number(configService.get('cache.api.cache_ttl')) / 1000,
          });

          return {
            ttl: configService.get('cache.api.cache_ttl'),
            store: store as unknown as CacheStore,
          };
        } catch (error) {
          return {
            ttl: configService.get('cache.api.cache_ttl'),
            store: undefined,
          };
        }
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configAuth, configCache],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.jwt_secret_key'),
        global: true,
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [...controllers],
  providers: [
    Reflector,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    ...services,
  ],
  exports: [],
})
export class ApiModule implements OnApplicationBootstrap {
  constructor() {}
  async onApplicationBootstrap() {}
}
