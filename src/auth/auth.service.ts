import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { username, passwordHash } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('username already exists');
    }

    const hashedPassword = await bcrypt.hash(passwordHash, 12);

    const user = await this.prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
      },
    });

    const tokens = await this.generateTokens(user.id, user.username);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens, // spreads accessToken and refreshToken
      id: user.id,
    };
  }

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user)
      throw new UnauthorizedException(
        'Username and password do not match invoke!user',
      );

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch)
      throw new UnauthorizedException(
        'Username and password do not match invoke!passwordMatch',
      );

    return user;
  }

  async login(user: User) {
    const tokens = await this.generateTokens(user.id, user.username);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private async generateTokens(userId: string, username: string) {
    const payload = { userId, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }

  async refresh(username: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const token = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!token) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(user.id, user.username);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
