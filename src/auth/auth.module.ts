import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    // Register without a default secret — each signAsync/verify call
    // explicitly passes its own secret (JWT_ACCESS_SECRET or JWT_REFRESH_SECRET).
    JwtModule.register({}),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
