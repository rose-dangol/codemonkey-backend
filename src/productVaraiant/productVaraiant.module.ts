import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

import { ProductVaraiantService } from './productVaraiant.service';
import { ProductVaraiantController } from './productVaraiant.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProductVaraiantController],
  providers: [ProductVaraiantService],
})
export class ProductVaraiantModule {}
