import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token to generate new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token to revoke',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'New access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for generating new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'uuid-string',
      email: 'user@example.com',
      username: 'johndoe',
      role: 'user',
    },
  })
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export class SessionDto {
  @ApiProperty({
    description: 'Session ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Device information',
    example: {
      userAgent: 'Mozilla/5.0...',
      ip: '192.168.1.1',
      deviceId: 'device-uuid',
    },
  })
  deviceInfo: {
    userAgent?: string;
    ip?: string;
    deviceId?: string;
  };

  @ApiProperty({
    description: 'Session creation date',
    example: '2023-06-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Session expiry date',
    example: '2023-06-22T10:30:00Z',
  })
  expiresAt: Date;
}