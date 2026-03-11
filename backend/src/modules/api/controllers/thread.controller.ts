import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ThreadService } from '../services/thread.service';
import { WebSocketGateway } from '../../websocket/websocket.gateway';

@ApiTags('Threads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('threads')
export class ThreadController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly wsGateway: WebSocketGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new thread' })
  async createThread(
    @Request() req,
    @Body() body: { title?: string },
  ) {
    return this.threadService.createThread(req.user.sub, body.title);
  }

  @Get()
  @ApiOperation({ summary: 'Get all threads for current user' })
  async getThreads(
    @Request() req,
    @Query('page') page = 1,
    @Query('take') take = 20,
  ) {
    return this.threadService.getUserThreads(req.user.sub, +page, +take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get thread detail with messages' })
  async getThread(@Param('id') id: string, @Request() req) {
    return this.threadService.getThread(id, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a thread (soft delete)' })
  async deleteThread(@Param('id') id: string, @Request() req) {
    return this.threadService.deleteThread(id, req.user.sub);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages in a thread' })
  async getMessages(
    @Param('id') id: string,
    @Request() req,
    @Query('page') page = 1,
    @Query('take') take = 50,
  ) {
    // Verify ownership
    await this.threadService.getThread(id, req.user.sub);
    return this.threadService.getThreadMessages(id, +page, +take);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in thread' })
  async sendMessage(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { content?: string; image_url?: string },
  ) {
    const message = await this.threadService.createUserMessage(id, req.user.sub, body.content || '', body.image_url);

    // Lấy thread info để gửi kèm notification cho admin
    const thread = await this.threadService.getThread(id);
    // Emit cho tất cả admin đang online → phát chuông + badge
    this.wsGateway.emitNewUserMessage(id, message, thread);

    return message;
  }
}
