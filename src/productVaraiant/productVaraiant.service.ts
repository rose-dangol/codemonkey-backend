import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductVariantDto } from './dto/productVaraiant.dto';

@Injectable()
export class ProductVaraiantService {
  constructor(private prisma: PrismaService) {}

  async addProductVariant(productVariantPayload: CreateProductVariantDto) {
    const existingVariants = await this.prisma.productVariant.findMany({
      where: {
        productId: productVariantPayload.productId,
      },
      include: {
        attributes: true,
      },
    });

    const incomingAttributes = productVariantPayload.attributes
      .map((a) => `${a.attributeId}:${a.value}`)
      .sort()
      .join('|');

    const duplicate = existingVariants.find((variant) => {
      const variantAttributes = variant.attributes
        .map((a) => `${a.attributeId}:${a.value}`)
        .sort()
        .join('|');

      return variantAttributes === incomingAttributes;
    });

    if (duplicate) {
      throw new ConflictException('Same variant already exists');
    }

    return this.prisma.productVariant.create({
      data: {
        productId: productVariantPayload.productId,
        sku: productVariantPayload.sku,
        price: productVariantPayload.price,
        stock: productVariantPayload.stock,

        attributes: {
          create: productVariantPayload.attributes.map((attr) => ({
            attributeId: attr.attributeId,
            value: attr.value,
          })),
        },
      },

      include: {
        attributes: true,
      },
    });
  }

  async updateProductVariant(
    id: string,
    productVariantPayload: CreateProductVariantDto,
  ) {
    return this.prisma.productVariant.update({
      where: { id },
      data: {
        productId: productVariantPayload.productId,
        sku: productVariantPayload.sku,
        price: productVariantPayload.price,
        stock: productVariantPayload.stock,

        attributes: {
          deleteMany: {},
          create: productVariantPayload.attributes.map((attr) => ({
            attributeId: attr.attributeId,
            value: attr.value,
          })),
        },
      },

      include: {
        attributes: true,
      },
    });
  }

  async getAllProductVariant() {
    const variants = await this.prisma.productVariant.findMany({
      include: {
        attributes: {
          include: {
            attribute: true,
          },
        },
      },
    });

    return variants.map((variant) => ({
      ...variant,

      attributes: variant.attributes.map((attr) => ({
        id: attr.id,

        attributeId: attr.attributeId,

        value: attr.value,

        key: attr.attribute.key,

        name: attr.attribute.name,

        type: attr.attribute.type,
      })),
    }));
  }
}
