import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async createCart(customerId: string) {
    return this.prisma.cart.upsert({
      where: { customerId },
      create: { customerId },
      update: {},
      include: { items: true },
    });
  }

  async getCart(customerId: string) {
    return this.prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    brand: true,
                    productCategory: true,
                  },
                },
                attributes: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async addToCart(customerId: string, variantId: string, quantity: number) {
    const cart = await this.createCart(customerId);

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) throw new Error('Variant not found');

    return this.prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
      create: {
        cartId: cart.id,
        variantId,
        quantity,
        priceSnapshot: variant.price,
      },
      update: {
        quantity: { increment: quantity },
      },
    });
  }

  async clearCart(tx: any, cartId: string) {
    return tx.cartItem.deleteMany({
      where: {
        cartId,
      },
    });
  }
}
