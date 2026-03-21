import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async updateCoverPicture(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const uploadResult = await this.cloudinary.uploadFile(file);

    if ('url' in uploadResult) {
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          coverPictureUrl: uploadResult.url,
        },
      });
    } else {
      throw new Error('Failed to upload image to Cloudinary');
    }
  }
}
