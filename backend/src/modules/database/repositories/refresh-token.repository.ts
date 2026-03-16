import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async create(data: Partial<RefreshTokenEntity>): Promise<RefreshTokenEntity> {
    console.log(`🔍 [RefreshTokenRepository] [create] data:`, data);
    const refreshToken = this.refreshTokenRepository.create(data);
    return await this.refreshTokenRepository.save(refreshToken);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    console.log(`🔍 [RefreshTokenRepository] [findByTokenHash] tokenHash:`, tokenHash);
    return await this.refreshTokenRepository.findOne({
      where: { 
        token_hash: tokenHash, 
        is_active: true,
        expires_at: MoreThan(new Date())
      },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<RefreshTokenEntity[]> {
    console.log(`🔍 [RefreshTokenRepository] [findByUserId] userId:`, userId);
    return await this.refreshTokenRepository.find({
      where: { 
        user_id: userId, 
        is_active: true,
        expires_at: MoreThan(new Date())
      },
    });
  }

  async deactivateToken(tokenHash: string): Promise<void> {
    console.log(`🔍 [RefreshTokenRepository] [deactivateToken] tokenHash:`, tokenHash);
    await this.refreshTokenRepository.update(
      { token_hash: tokenHash },
      { is_active: false }
    );
  }

  async deactivateAllUserTokens(userId: string): Promise<void> {
    console.log(`🔍 [RefreshTokenRepository] [deactivateAllUserTokens] userId:`, userId);
    await this.refreshTokenRepository.update(
      { user_id: userId },
      { is_active: false }
    );
  }

  async cleanupExpiredTokens(): Promise<void> {
    console.log(`🔍 [RefreshTokenRepository] [cleanupExpiredTokens]`);
    await this.refreshTokenRepository.delete({
      expires_at: MoreThan(new Date())
    });
  }
}