import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Parse DATABASE_URL into connection parameters
 * Format: postgresql://username:password@host:port/database
 */
const parseDatabaseUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return {
      host: parsedUrl.hostname,
      port: parsedUrl.port ? Number(parsedUrl.port) : 5432,
      username: parsedUrl.username,
      password: parsedUrl.password,
      database: parsedUrl.pathname.slice(1), // Remove leading '/'
    };
  } catch (error) {
    console.log(`[⚠️] [database.config] [parseDatabaseUrl] [error]:`, error);
    return null;
  }
};

export const configDb = registerAs(
  'db',
  (): TypeOrmModuleOptions => {
    const databaseUrl = process.env.DATABASE_URL;

    // If DATABASE_URL is provided, use it directly with url property
    if (databaseUrl) {
      return {
        type: 'postgres',
        url: databaseUrl,
        synchronize: Boolean(Number(process.env.DB_SYNC)) || false,
        autoLoadEntities: true,
        logging: Boolean(Number(process.env.DB_DEBUG)) || false,
        ssl: { rejectUnauthorized: false },
        extra: {
          ssl: { rejectUnauthorized: false },
        },
      };
    }

    // Fallback to individual env vars
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'postgres',
      synchronize: Boolean(Number(process.env.DB_SYNC)) || false,
      autoLoadEntities: true,
      logging: Boolean(Number(process.env.DB_DEBUG)) || false,
    };
  },
);
