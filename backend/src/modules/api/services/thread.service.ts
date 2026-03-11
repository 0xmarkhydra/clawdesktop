import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ThreadRepository, MessageRepository } from '@/database/repositories';
import { ThreadStatus } from '@/database/entities/thread.entity';
import { MessageRole } from '@/database/entities/message.entity';
import { GeminiService } from '@/business/services/gemini.service';
import { KnowledgeService } from '@/business/services/knowledge.service';

@Injectable()
export class ThreadService {
  constructor(
    private threadRepository: ThreadRepository,
    private messageRepository: MessageRepository,
    private geminiService: GeminiService,
    private knowledgeService: KnowledgeService,
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

  async deleteThread(threadId: string, userId: string) {
    await this.getThread(threadId, userId);
    await this.threadRepository.softDelete(threadId);
    return { deleted: true };
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

  async createUserMessage(threadId: string, userId: string, content: string, imageUrl?: string) {
    const thread = await this.getThread(threadId, userId);

    const message = this.messageRepository.create({
      thread_id: thread.id,
      content: content || '',
      image_url: imageUrl || null,
      role: MessageRole.USER,
    });
    const saved = await this.messageRepository.save(message);

    // Cập nhật updated_at của thread
    await this.threadRepository.update(thread.id, { updated_at: new Date() });

    // Trigger AI Auto-reply nếu thread đang bật chế độ is_auto_reply
    if (thread.is_auto_reply) {
      const context = this.knowledgeService.getVpsContext();
      
      // Lấy danh sách lịch sử tin nhắn (tối đa 20 tin nhắn gần nhất để làm ngữ cảnh)
      const history = await this.messageRepository.find({
        where: { thread_id: thread.id, deleted_at: null },
        order: { created_at: 'ASC' },
        take: 20
      });

      // Chạy ngầm không await để trả về user response nhanh
      this.geminiService.streamAutoReply(thread.id, context, history).catch((err) => {
        console.error('Lỗi khi chạy auto-reply:', err);
      });
    }

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

  async saveAiMessage(threadId: string, adminDraft: string, aiContent: string, imageUrl?: string) {
    // Lưu bản gốc của admin
    await this.messageRepository.save(
      this.messageRepository.create({
        thread_id: threadId,
        content: adminDraft || '',
        image_url: imageUrl || null,
        role: MessageRole.ADMIN_DRAFT,
      }),
    );

    // Lưu tin nhắn AI hoàn chỉnh
    const aiMessage = this.messageRepository.create({
      thread_id: threadId,
      content: aiContent || '',
      image_url: imageUrl || null,
      role: MessageRole.AI,
    });
    const saved = await this.messageRepository.save(aiMessage);

    // Cập nhật updated_at của thread
    await this.threadRepository.update(threadId, { updated_at: new Date() });
    return saved;
  }

  // Cập nhật trạng thái auto-reply
  async toggleAutoReply(threadId: string, isAutoReply: boolean) {
    const thread = await this.threadRepository.findOne({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Thread not found');
    thread.is_auto_reply = isAutoReply;
    const saved = await this.threadRepository.save(thread);
    return saved;
  }
}
