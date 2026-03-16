import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity extends BaseEntity {
  @Column()
  @Index()
  token_hash: string;

  @Column()
  user_id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  device_info: {
    userAgent?: string;
    ip?: string;
    deviceId?: string;
  };

  @Column({ default: true })
  is_active: boolean;
}