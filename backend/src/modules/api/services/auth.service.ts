import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '@/database/repositories';
import { UserRole } from '@/database/entities/user.entity';
import { RegisterDto, LoginDto, AdminLoginDto } from '../dtos/register-login.dto';
import { JwtTokenService, DeviceInfo } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private jwtTokenService: JwtTokenService,
  ) {}

  async register(dto: RegisterDto, deviceInfo?: DeviceInfo) {
    console.log(`🔍 [AuthService] [register] email:`, dto.email);
    
    const exist = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exist) {
      throw new BadRequestException('Email already exists');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      password: hashed,
      username: dto.username,
      role: UserRole.USER,
    });
    await this.userRepository.save(user);

    const tokens = await this.jwtTokenService.generateTokenPair(user, deviceInfo);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    };
  }

  async login(dto: LoginDto, deviceInfo?: DeviceInfo) {
    console.log(`🔍 [AuthService] [login] email:`, dto.email);
    
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.jwtTokenService.generateTokenPair(user, deviceInfo);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    };
  }

  async adminLogin(dto: AdminLoginDto, deviceInfo?: DeviceInfo) {
    console.log(`🔍 [AuthService] [adminLogin] username:`, dto.username);
    
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (dto.username !== adminUsername || dto.password !== adminPassword) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Tìm hoặc tạo admin user trong DB
    let admin = await this.userRepository.findOne({
      where: { email: `${adminUsername}@admin.local`, role: UserRole.ADMIN },
    });

    if (!admin) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      admin = this.userRepository.create({
        email: `${adminUsername}@admin.local`,
        password: hashed,
        username: adminUsername,
        role: UserRole.ADMIN,
      });
      await this.userRepository.save(admin);
    }

    const tokens = await this.jwtTokenService.generateTokenPair(admin, deviceInfo);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: admin.id, email: admin.email, username: admin.username, role: admin.role },
    };
  }

  async refreshToken(refreshToken: string) {
    console.log(`🔍 [AuthService] [refreshToken]`);
    
    return await this.jwtTokenService.refreshAccessToken(refreshToken);
  }

  async logout(refreshToken: string) {
    console.log(`🔍 [AuthService] [logout]`);
    
    await this.jwtTokenService.revokeRefreshToken(refreshToken);
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    console.log(`🔍 [AuthService] [logoutAll] userId:`, userId);
    
    await this.jwtTokenService.revokeAllUserTokens(userId);
    return { message: 'Logged out from all devices successfully' };
  }

  async getUserSessions(userId: string) {
    console.log(`🔍 [AuthService] [getUserSessions] userId:`, userId);
    
    return await this.jwtTokenService.getUserActiveTokens(userId);
  }

  private signToken(userId: string, email: string, role: UserRole): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }
}
