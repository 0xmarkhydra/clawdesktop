import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ThreadEntity } from './thread.entity';

export enum MessageRole {
  USER = 'user',     // Tin nhắn của user
  AI = 'ai',         // Tin nhắn AI (đã transform qua DeepSeek)
  ADMIN_DRAFT = 'admin_draft', // Bản gốc của admin trước khi transform
}

@Entity('messages')
export class MessageEntity extends BaseEntity {
  @Column()
  @Index()
  thread_id: string;

  @ManyToOne(() => ThreadEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id' })
  thread: ThreadEntity;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageRole,
    default: MessageRole.USER,
  })
  role: MessageRole;
}
