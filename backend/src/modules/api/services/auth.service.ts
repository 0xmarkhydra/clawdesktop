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

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
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

    const token = this.signToken(user.id, user.email, user.role);
    return {
      access_token: token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.signToken(user.id, user.email, user.role);
    return {
      access_token: token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    };
  }

  async adminLogin(dto: AdminLoginDto) {
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

    const token = this.signToken(admin.id, admin.email, admin.role);
    return {
      access_token: token,
      user: { id: admin.id, email: admin.email, username: admin.username, role: admin.role },
    };
  }

  private signToken(userId: string, email: string, role: UserRole): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }
}
