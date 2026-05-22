import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
