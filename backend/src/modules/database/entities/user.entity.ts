import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;
}
