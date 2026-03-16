import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { RefreshTokenRepository } from '../../database/repositories/refresh-token.repository';
import { UserEntity } from '../../database/entities/user.entity';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface DeviceInfo {
  userAgent?: string;
  ip?: string;
  deviceId?: string;
}

@Injectable()
export class JwtTokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {
    this.accessTokenSecret = this.configService.get('JWT_SECRET') || 'default-access-secret';
    this.refreshTokenSecret = this.configService.get('JWT_REFRESH_SECRET') || 'default-refresh-secret';
    this.accessTokenExpiresIn = this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m';
    this.refreshTokenExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  async generateTokenPair(user: UserEntity, deviceInfo?: DeviceInfo): Promise<TokenPair> {
    console.log(`🔍 [JwtTokenService] [generateTokenPair] userId:`, user.id);

    const payload: Omit<JwtPayload, 'type'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        secret: this.accessTokenSecret,
        expiresIn: this.accessTokenExpiresIn,
      }
    );

    // Generate refresh token
    const refreshTokenPayload = { ...payload, type: 'refresh' };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiresIn,
    });

    // Hash refresh token for storage
    const tokenHash = this.hashToken(refreshToken);

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store refresh token in database
    await this.refreshTokenRepository.create({
      token_hash: tokenHash,
      user_id: user.id,
      expires_at: expiresAt,
      device_info: deviceInfo,
      is_active: true,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    console.log(`🔍 [JwtTokenService] [refreshAccessToken]`);

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.refreshTokenSecret,
      }) as JwtPayload;

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Check if token exists in database and is active
      const tokenHash = this.hashToken(refreshToken);
      const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token not found or expired');
      }

      // Generate new access token
      const newAccessToken = this.jwtService.sign(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          type: 'access',
        },
        {
          secret: this.accessTokenSecret,
          expiresIn: this.accessTokenExpiresIn,
        }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      console.log(`🔴 [JwtTokenService] [refreshAccessToken] error:`, error.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    console.log(`🔍 [JwtTokenService] [verifyAccessToken]`);

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.accessTokenSecret,
      }) as JwtPayload;

      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch (error) {
      console.log(`🔴 [JwtTokenService] [verifyAccessToken] error:`, error.message);
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    console.log(`🔍 [JwtTokenService] [revokeRefreshToken]`);

    const tokenHash = this.hashToken(refreshToken);
    await this.refreshTokenRepository.deactivateToken(tokenHash);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    console.log(`🔍 [JwtTokenService] [revokeAllUserTokens] userId:`, userId);

    await this.refreshTokenRepository.deactivateAllUserTokens(userId);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async getUserActiveTokens(userId: string): Promise<any[]> {
    console.log(`🔍 [JwtTokenService] [getUserActiveTokens] userId:`, userId);

    const tokens = await this.refreshTokenRepository.findByUserId(userId);
    return tokens.map(token => ({
      id: token.id,
      deviceInfo: token.device_info,
      createdAt: token.created_at,
      expiresAt: token.expires_at,
    }));
  }
}