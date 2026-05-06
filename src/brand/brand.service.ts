import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddBrandDto } from './dto/AddBrandDto';
import { UpdateBrandDto } from './dto/UpdateBrandDto';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) { }

  async addBrand(brandDetail: AddBrandDto) {
    return this.prisma.brand.create({
      data: {
        brandName: brandDetail.brandName,
        brandImage: brandDetail.brandImage,
        brandDesc: brandDetail.brandDesc,
        ...(brandDetail.productId?.length && {
          products: {
            connect: brandDetail.productId.map((id) => ({
              id,
            })),
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

  async updateBrand(brandDetail: UpdateBrandDto, brandId: string) {
    const updatedBrand = await this.prisma.brand.update({
      where: { id: brandId },
      data: {
        ...(brandDetail.brandName !== undefined && {
          brandName: brandDetail.brandName,
        }),
        ...(brandDetail.brandImage !== undefined && {
          brandImage: brandDetail.brandImage,
        }),
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
}

