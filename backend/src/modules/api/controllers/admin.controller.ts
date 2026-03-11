import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from '@/database/entities/user.entity';
import { ThreadService } from '../services/thread.service';
import { GeminiService } from '@/business/services/gemini.service';
import { WebSocketGateway } from '../../websocket/websocket.gateway';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly geminiService: GeminiService,
    private readonly wsGateway: WebSocketGateway,
  ) {}

  @Get('threads')
  @ApiOperation({ summary: '[Admin] Get all threads from all users' })
  async getAllThreads(
    @Query('page') page = 1,
    @Query('take') take = 20,
  ) {
    return this.threadService.getAllThreads(+page, +take);
  }

  @Get('threads/:id')
  @ApiOperation({ summary: '[Admin] Get thread detail' })
  async getThread(@Param('id') id: string) {
    return this.threadService.getThread(id);
  }

  @Get('threads/:id/messages')
  @ApiOperation({ summary: '[Admin] Get messages in thread' })
  async getMessages(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('take') take = 50,
  ) {
    return this.threadService.getThreadMessages(id, +page, +take);
  }

  @Post('threads/:id/toggle-auto-reply')
  @ApiOperation({ summary: '[Admin] Toggle bot auto reply for a thread' })
  async toggleAutoReply(
    @Param('id') threadId: string,
    @Body() body: { is_auto_reply: boolean },
  ) {
    return this.threadService.toggleAutoReply(threadId, body.is_auto_reply);
  }

  @Post('threads/:id/reply')
  @ApiOperation({ summary: '[Admin] Reply to user — triggers DeepSeek stream to user' })
  async adminReply(
    @Param('id') threadId: string,
    @Body() body: { message?: string; image_url?: string },
    @Request() req,
    @Res() res: Response,
  ) {
    // 1. Verify thread exists
    await this.threadService.getThread(threadId);

    const messageText = body.message || '';
    const imageUrl = body.image_url;

    // If admin sends image-only (no text), skip Gemini transform and send directly
    if (!messageText && imageUrl) {
      const savedMessage = await this.threadService.saveAiMessage(threadId, '', '', imageUrl);
      this.wsGateway.emitStreamDone(threadId, savedMessage);
      return res.status(200).json({ success: true, message: savedMessage });
    }

    // 2. Emit typing indicator to user
    this.wsGateway.emitTyping(threadId);

    // Helper: fallback — gửi thẳng tin nhắn admin (không transform)
    const sendFallback = async () => {
      console.warn('[AdminController] DeepSeek unavailable — sending admin message directly');
      // Stream từng chữ của tin nhắn gốc để giữ UX streaming
      const words = messageText.split('');
      for (const char of words) {
        this.wsGateway.emitStreamChunk(threadId, char);
        await new Promise(r => setTimeout(r, 8));
      }
      const savedMessage = await this.threadService.saveAiMessage(threadId, messageText, messageText, imageUrl);
      this.wsGateway.emitStreamDone(threadId, savedMessage);
      if (!res.headersSent) {
        res.status(200).json({ success: true, message: savedMessage, fallback: true });
      }
    };

    // 3. Kiểm tra API key trước — nếu thiếu, fallback ngay
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('[AdminController] GEMINI_API_KEY not set — using fallback');
      await sendFallback();
      return;
    }

    // 4. Stream Gemini response
    let fullAiContent = '';
    const stream$ = this.geminiService.streamTransform(messageText);

    stream$.subscribe({
      next: (chunk: string) => {
        fullAiContent += chunk;
        this.wsGateway.emitStreamChunk(threadId, chunk);
      },
      error: async (err) => {
        console.error('[AdminController] DeepSeek stream error — falling back:', err.message);
        await sendFallback();
      },
      complete: async () => {
        const savedMessage = await this.threadService.saveAiMessage(threadId, messageText, fullAiContent, imageUrl);
        this.wsGateway.emitStreamDone(threadId, savedMessage);
        if (!res.headersSent) {
          res.status(200).json({ success: true, message: savedMessage });
        }
      },
    });
  }
}
