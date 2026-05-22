import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddBrandDto } from './dto/AddBrandDto';
import { UpdateBrandDto } from './dto/UpdateBrandDto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class BrandService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async addBrand(brandDetail: AddBrandDto, file?: Express.Multer.File) {
    let imageUrl: string | undefined;

    if (file) {
      const uploaded = await this.cloudinary.uploadFile(file);
      if ('url' in uploaded) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        imageUrl = uploaded.url;
      } else {
        throw new Error('Failed to upload image.');
      }
    }

    return this.prisma.brand.create({
      data: {
        brandName: brandDetail.brandName,
        brandImage: imageUrl,
        brandDesc: brandDetail.brandDesc,
        ...(brandDetail.productId?.length && {
          products: {
            connect: brandDetail.productId.map((id) => ({ id })),
          },
        }),
      },
    });
  }

  async getBrand() {
    return this.prisma.brand.findMany({
      include: {
        products: true,
      },
    });
  }

  async getBrandById(brandId: string) {
    return this.prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        products: true,
      },
    });
  }

  async updateBrand(
    brandDetail: UpdateBrandDto,
    brandId: string,
    file?: Express.Multer.File,
  ) {
    const existingBrand = await this.prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!existingBrand) {
      throw new NotFoundException(`Brand with ID ${brandId} not found`);
    }

    let imageUrl = existingBrand.brandImage;

    if (file) {
      const uploaded = await this.cloudinary.uploadFile(file);
      if (uploaded && 'url' in uploaded) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        imageUrl = uploaded.url;

        // delete old image from Cloudinary if it exists
        if (existingBrand.brandImage) {
          const publicId = this.cloudinary.getPublicIdFromUrl(
            existingBrand.brandImage,
          );
          if (publicId) {
            try {
              await this.cloudinary.deleteFile(publicId);
            } catch (error) {
              console.error(
                `Failed to delete old image ${publicId} from Cloudinary:`,
                error,
              );
            }
          }
        }
      } else {
        throw new Error('Failed to upload image.');
      }
    } else if (brandDetail.brandImage !== undefined) {
      const oldImageUrl = existingBrand.brandImage;
      imageUrl = brandDetail.brandImage;

      // If the old image URL has changed/cleared, delete it from Cloudinary
      if (oldImageUrl && oldImageUrl !== imageUrl) {
        const publicId = this.cloudinary.getPublicIdFromUrl(oldImageUrl);
        if (publicId) {
          try {
            await this.cloudinary.deleteFile(publicId);
          } catch (error) {
            console.error(
              `Failed to delete old image ${publicId} from Cloudinary:`,
              error,
            );
          }
        }
      }
    }

    const updatedBrand = await this.prisma.brand.update({
      where: { id: brandId },
      data: {
        ...(brandDetail.brandName !== undefined && {
          brandName: brandDetail.brandName,
        }),
        brandImage: imageUrl,
        ...(brandDetail.brandDesc !== undefined && {
          brandDesc: brandDetail.brandDesc,
        }),
      },
    });

    if (brandDetail.productId) {
      const products = await this.prisma.product.findMany({
        where: {
          id: { in: brandDetail.productId },
        },
        select: {
          id: true,
          isHidden: true,
        },
      });

      await Promise.all(
        products.map((p) =>
          this.prisma.product.update({
            where: { id: p.id },
            data: {
              isHidden: !p.isHidden,
            },
          }),
        ),
      );
    }
    return updatedBrand;
  }

  async deleteBrand(brandId: string[]) {
    if (!brandId || brandId.length === 0) {
      throw new NotFoundException('No brand Selected');
    }

    const brands = await this.prisma.brand.findMany({
      where: {
        id: { in: brandId },
      },
      select: {
        id: true,
        brandImage: true,
      },
    });

    if (!brands.length) {
      throw new NotFoundException('Brand not found');
    }

    const brandWithProducts = await this.prisma.product.findMany({
      where: {
        brandId: {
          in: brandId,
        },
      },
      select: {
        brandId: true,
      },
    });

    if (brandWithProducts.length > 0) {
      throw new BadRequestException(
        'Cannot delete, some brands contain products',
      );
    }

    await Promise.all(
      brands.map(async (cat) => {
        if (cat.brandImage) {
          const publicId = this.cloudinary.getPublicIdFromUrl(cat.brandImage);
          if (publicId) {
            await this.cloudinary.deleteFile(publicId);
          }
        }
      }),
    );

    return await this.prisma.brand.deleteMany({
      where: {
        id: {
          in: brandId,
        },
      },
    });
  }
}
