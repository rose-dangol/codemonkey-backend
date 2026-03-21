import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddProductDto } from './dto/addProduct.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async validateProduct(productName: string) {
    const product = await this.prisma.product.findUnique({
      where: { productName },
    });
    if (product) {
      throw new ConflictException('This product already exists ');
    }
    return product;
  }

  async addProduct(productDetail: AddProductDto) {
    return this.prisma.product.create({
      data: {
        productName: productDetail.productName,
        productImage: productDetail.productImage,
        quantity: productDetail.quantity ?? 0,
        productCategory: {
          connect: {
            id: productDetail.productCategoryId,
          },
        },
      },
    });
  }

  async getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async updateProduct(id: string, productDetail: AddProductDto) {
    const { productCategoryId, ...rest } = productDetail;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(productCategoryId && {
          productCategory: {
            connect: { id: productCategoryId },
          },
        }),
      },
    });
  }

  async deleteProduct(ids: string[]) {
    const result = await this.prisma.product.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    if (result.count == 0) {
      throw new NotFoundException('Product not found');
    }
    return result;
  }
}
