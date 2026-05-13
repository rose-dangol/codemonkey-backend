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

  //Register
  async registerWithTokens(dto: RegisterDto) {
    const { username, passwordHash } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
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

    // Controller will pluck refreshToken for the httpOnly cookie
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      id: user.id,
    };
  }

  //Validate
  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  //Login
  // returns { accessToken, refreshToken }
  // controller sets refreshToken as an httpOnly cookie returning only accessToken to client

  async login(user: User) {
    const tokens = await this.generateTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // Refresh
  // Validates the refreshToken (read from the httpOnly cookie by the controller)
  // returns a new { accessToken, refreshToken }

  async refresh(refreshToken: string) {
    // Decode without verification first to get userId
    let payload: { userId: string; username: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    // Rotate: generate new pair
    const tokens = await this.generateTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // Logout
  async logout(userId: string) {
    // Invalidate stored refresh token hash
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
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

  // verify access token

  verifyAccessToken(token: string): { userId: string; username: string } {
    try {
      return this.jwt.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
