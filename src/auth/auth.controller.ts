import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

//Shared cookie options
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    const { accessToken, refreshToken } = await this.authService.login(user);

    // Set refreshToken as httpOnly cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    // Return only access token
    return { accessToken };
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, id } =
      await this.authService.registerWithTokens(registerDto);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    return { accessToken, id };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken: string | undefined = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);

    // Rotate the cookie with the new refresh token
    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

    return { accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken: string | undefined = req.cookies?.refreshToken;

    if (refreshToken) {
      // find userId and null-out the stored hash
      try {
        const payload = this.authService.verifyAccessToken(
          req.headers.authorization?.replace('Bearer ', '') ?? '',
        );
        await this.authService.logout(payload.userId);
      } catch {
        // If the access token is already expired, still clear the cookie
      }
    }

    // Clear the httpOnly cookie
    res.clearCookie('refreshToken', { path: '/' });

    return { message: 'Logged out successfully' };
  }
}
