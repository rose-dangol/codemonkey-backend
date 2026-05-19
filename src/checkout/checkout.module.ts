import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';



@Module({
  imports: [PrismaModule],
  providers: [CheckoutService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
