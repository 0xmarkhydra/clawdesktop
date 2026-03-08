import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { OpenAIService } from './services/openai.service';
import { DeepSeekService } from './services/deepseek.service';
import { GeminiService } from './services/gemini.service';
import { ConfigModule } from '@nestjs/config';

const services = [OpenAIService, DeepSeekService, GeminiService];

@Module({
  imports: [DatabaseModule, ConfigModule],
  exports: [...services],
  providers: [...services],
})
export class BusinessModule {}
