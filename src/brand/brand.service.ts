import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddBrandDto } from './dto/AddBrandDto';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.brand.findMany();
  }
}
