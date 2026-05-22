import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
