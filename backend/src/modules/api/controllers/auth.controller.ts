import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../decorator/public.decorator';
import { User } from '../decorator/user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, AdminLoginDto, AuthResponseDto } from '../dtos/register-login.dto';
import { RefreshTokenDto, LogoutDto, TokenResponseDto, LoginResponseDto, SessionDto } from '../dtos/refresh-token.dto';
import { DeviceInfo } from '../services/jwt.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const deviceInfo: DeviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      deviceId: req.headers['x-device-id'] as string,
    };
    return this.authService.register(dto, deviceInfo);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email & password' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const deviceInfo: DeviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      deviceId: req.headers['x-device-id'] as string,
    };
    return this.authService.login(dto, deviceInfo);
  }

  @Public()
  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login (credentials from .env)' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async adminLogin(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const deviceInfo: DeviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      deviceId: req.headers['x-device-id'] as string,
    };
    return this.authService.adminLogin(dto, deviceInfo);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ 
    summary: 'Refresh access token using refresh token',
    description: 'Generate a new access token using a valid refresh token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'New access token generated successfully',
    type: TokenResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid or expired refresh token' 
  })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Logout from current device',
    description: 'Revoke the refresh token for current device'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logged out successfully' 
  })
  async logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Logout from all devices',
    description: 'Revoke all refresh tokens for the user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logged out from all devices successfully' 
  })
  async logoutAll(@User() user: any) {
    return this.authService.logoutAll(user.userId);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user active sessions',
    description: 'Get list of active sessions/devices for the user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Active sessions retrieved successfully',
    type: [SessionDto]
  })
  async getSessions(@User() user: any) {
    return this.authService.getUserSessions(user.userId);
  }
}
