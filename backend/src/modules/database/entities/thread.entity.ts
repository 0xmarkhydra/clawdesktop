import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

export enum ThreadStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('threads')
export class ThreadEntity extends BaseEntity {
  @Column({ nullable: true })
  title: string;

  @Column()
  @Index()
  user_id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'enum',
    enum: ThreadStatus,
    default: ThreadStatus.ACTIVE,
  })
  status: ThreadStatus;
}
