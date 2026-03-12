import { Injectable } from '@nestjs/common';
import { ThreadEntity } from '@/database/entities/thread.entity';

@Injectable()
export class TelegramService {
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly chatId = process.env.TELEGRAM_CHAT_ID;
  private readonly topicId = process.env.TELEGRAM_TOPIC_ID;
  private readonly adminBaseUrl = process.env.ADMIN_BASE_URL || 'http://localhost:5173';

  async sendNewThreadNotification(
    thread: ThreadEntity,
    username: string,
    messageContent: string,
  ): Promise<void> {
    if (!this.botToken || !this.chatId) {
      console.warn('⚠️ TelegramService sendNewThreadNotification: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured');
      return;
    }

    const payload = this.buildNotificationPayload(thread.id, username, messageContent);
    await this.sendMessage(payload);
  }

  private buildNotificationPayload(
    threadId: string,
    username: string,
    messageContent: string,
  ): Record<string, unknown> {
    const link = `${this.adminBaseUrl}/admin?id=${threadId}`;
    const truncatedContent = messageContent.length > 300
      ? messageContent.slice(0, 300) + '...'
      : messageContent;

    // Use HTML parse mode: only need to escape <, >, & in text.
    // The URL stays as plain text — Telegram auto-detects and makes it clickable.
    const safeUsername = this.escapeHtml(username);
    const safeContent = this.escapeHtml(truncatedContent);
    const text = `👤 <b>${safeUsername}</b>\n📨 ${safeContent}\n\n🔗 ${link}`;

    return {
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
  }

  private async sendMessage(extraPayload: Record<string, unknown>): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    const payload: Record<string, unknown> = {
      chat_id: this.chatId,
      ...extraPayload,
    };

    if (this.topicId) {
      payload.message_thread_id = Number(this.topicId);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`🔴 TelegramService sendMessage failed: ${response.status} ${errorBody}`);
      } else {
        console.log(`✅ TelegramService sendMessage: notification sent successfully`);
      }
    } catch (error) {
      console.error('🔴 TelegramService sendMessage error:', error);
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
