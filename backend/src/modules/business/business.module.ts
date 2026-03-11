import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { OpenAIService } from './services/openai.service';
import { DeepSeekService } from './services/deepseek.service';
import { GeminiService } from './services/gemini.service';
import { ConfigModule } from '@nestjs/config';
import { KnowledgeService } from './services/knowledge.service';

const services = [DeepSeekService, GeminiService, OpenAIService, KnowledgeService];

@Module({
  imports: [DatabaseModule, ConfigModule, WebSocketModule],
  exports: [...services],
  providers: [...services],
})
export class BusinessModule { }