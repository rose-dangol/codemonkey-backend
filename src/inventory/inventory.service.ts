import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma, ProductVariant } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  validateStock(cart: any) {
    for (const item of cart.items) {
      if (!item.variant) {
        throw new BadRequestException(`Variant ${item.variantId} not found`);
      }

      if (item.variant.stock <= 0) {
        throw new BadRequestException(
          `${item.variant.product.productName} is out of stock`,
        );
      }

      if (item.quantity > item.variant.stock) {
        throw new BadRequestException(
          `Insufficient stock for ${item.variant.product.productName}`,
        );
      }
    }
  }

  async decrementStock(tx: Prisma.TransactionClient, cart: any) {
    for (const item of cart.items) {
      await tx.productVariant.update({
        where: {
          id: item.variantId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }
  }

  async incrementStock(
    tx: Prisma.TransactionClient,
    items: {
      variantId: string;
      quantity: number;
    }[],
  ) {
    for (const item of items) {
      await tx.productVariant.update({
        where: {
          id: item.variantId,
        },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  async setStock(variantId: string, stock: number): Promise<ProductVariant> {
    if (stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    return this.prisma.productVariant.update({
      where: {
        id: variantId,
      },
      data: {
        stock,
      },
    });
  }
}
