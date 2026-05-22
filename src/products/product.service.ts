import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddProductDto } from './dto/addProduct.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async validateProduct(productName: string) {
    const product = await this.prisma.product.findUnique({
      where: { productName },
    });
    if (product) {
      throw new ConflictException('This product already exists ');
    }
    return product;
  }

  async getProduct() {
    return this.prisma.product.findMany({
      where: {
        isHidden: false,
      },
      include: {
        productCategory: true,
        brand: true,
      },
    });
  }
  async getAllProduct() {
    const products = await this.prisma.product.findMany({
      include: {
        productCategory: true,
        brand: true,
        variants: {
          include: {
            attributes: {
              include: {
                attribute: true,
              },
            },
          },
        },
      },
    });

    return products.map((product) => ({
      ...product,

      variants: product.variants.map((variant) => ({
        ...variant,

        attributes: variant.attributes.map((attr) => ({
          id: attr.id,

          attributeId: attr.attributeId,

          key: attr.attribute.key,

          value: attr.value,
        })),
      })),
    }));
  }

  async addProduct(productDto: AddProductDto, file?: Express.Multer.File) {
    let imageUrl: string | undefined;

    if (file) {
      const uploaded = await this.cloudinary.uploadFile(file);
      if (uploaded && 'url' in uploaded) {
        imageUrl = uploaded.url;
      } else {
        throw new BadRequestException('Failed to upload image.');
      }
    }

    return this.prisma.product.create({
      data: {
        productName: productDto.productName,
        productImage: imageUrl,
        quantity: Number(productDto.quantity ?? 0),
        ...(productDto.productCategoryId && {
          productCategory: {
            connect: {
              id: productDto.productCategoryId,
            },
          },
        }),

        ...(productDto.productBrandId && {
          brand: {
            connect: {
              id: productDto.productBrandId,
            },
          },
        }),
      },
    });
  }

  async getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async updateProduct(
    id: string,
    productDto: AddProductDto,
    file?: Express.Multer.File,
  ) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    let imageUrl = existingProduct.productImage;

    if (file) {
      const uploaded = await this.cloudinary.uploadFile(file);
      if (uploaded && 'url' in uploaded) {
        imageUrl = uploaded.url;
        // delete old image if exists
        if (existingProduct.productImage) {
          const publicId = this.cloudinary.getPublicIdFromUrl(
            existingProduct.productImage,
          );
          if (publicId) {
            try {
              await this.cloudinary.deleteFile(publicId);
            } catch (error) {
              console.error('Failed to delete old image', error);
            }
          }
        }
      } else {
        throw new BadRequestException('Failed to upload image.');
      }
    }

    const { productCategoryId, productBrandId, ...rest } = productDto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        productImage: imageUrl,
        ...(productCategoryId && {
          productCategory: { connect: { id: productCategoryId } },
        }),
        ...(productBrandId && {
          brand: { connect: { id: productBrandId } },
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
