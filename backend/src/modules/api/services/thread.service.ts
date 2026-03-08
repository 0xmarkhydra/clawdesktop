import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ThreadRepository, MessageRepository } from '@/database/repositories';
import { ThreadStatus } from '@/database/entities/thread.entity';
import { MessageRole } from '@/database/entities/message.entity';

@Injectable()
export class ThreadService {
  constructor(
    private threadRepository: ThreadRepository,
    private messageRepository: MessageRepository,
  ) {}

  async createThread(userId: string, title?: string) {
    const thread = this.threadRepository.create({
      user_id: userId,
      title: title || 'New Chat',
      status: ThreadStatus.ACTIVE,
    });
    return this.threadRepository.save(thread);
  }

  async getUserThreads(userId: string, page = 1, take = 20) {
    const [data, total] = await this.threadRepository.findAndCount({
      where: { user_id: userId, deleted_at: null },
      order: { updated_at: 'DESC' },
      skip: (page - 1) * take,
      take,
    });
    return {
      data,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / take),
        take,
        total,
      },
    };
  }

  async getThread(threadId: string, userId?: string) {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      relations: ['user'],
    });
    if (!thread) throw new NotFoundException('Thread not found');
    // Chỉ check ownership nếu userId được truyền vào (user thường)
    // Admin không truyền userId → không check
    if (userId && thread.user_id !== userId) throw new ForbiddenException('Access denied');
    return thread;
  }

  async getThreadMessages(threadId: string, page = 1, take = 50) {
    await this.threadRepository.findOne({ where: { id: threadId } });
    const [data, total] = await this.messageRepository.findAndCount({
      where: { thread_id: threadId, deleted_at: null },
      order: { created_at: 'ASC' },
      skip: (page - 1) * take,
      take,
    });
    return {
      data,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / take),
        take,
        total,
      },
    };
  }

  async createUserMessage(threadId: string, userId: string, content: string) {
    const thread = await this.getThread(threadId, userId);

    const message = this.messageRepository.create({
      thread_id: thread.id,
      content,
      role: MessageRole.USER,
    });
    const saved = await this.messageRepository.save(message);

    // Cập nhật updated_at của thread
    await this.threadRepository.update(thread.id, { updated_at: new Date() });
    return saved;
  }

  // Admin methods
  async getAllThreads(page = 1, take = 20) {
    const [data, total] = await this.threadRepository.findAndCount({
      relations: ['user'],
      order: { updated_at: 'DESC' },
      skip: (page - 1) * take,
      take,
    });
    return {
      data,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / take),
        take,
        total,
      },
    };
  }

  async saveAiMessage(threadId: string, adminDraft: string, aiContent: string) {
    // Lưu bản gốc của admin
    await this.messageRepository.save(
      this.messageRepository.create({
        thread_id: threadId,
        content: adminDraft,
        role: MessageRole.ADMIN_DRAFT,
      }),
    );

    // Lưu tin nhắn AI hoàn chỉnh
    const aiMessage = this.messageRepository.create({
      thread_id: threadId,
      content: aiContent,
      role: MessageRole.AI,
    });
    const saved = await this.messageRepository.save(aiMessage);

    // Cập nhật updated_at của thread
    await this.threadRepository.update(threadId, { updated_at: new Date() });
    return saved;
  }
}
