import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';


@Module({
  imports: [PrismaModule],
  providers: [PricingService],
  controllers: [PricingController],
})
export class PricingModule {}
