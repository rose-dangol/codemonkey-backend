import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) { }
  async createOrder(
    tx: Prisma.TransactionClient,
    payload: {
      customerId: string;
      cart: any;
      pricing: {
        subtotal: number;
        shippingFee: number;
        discountTotal: number;
        taxTotal: number;
        grandTotal: number;
      };
    },
  ) {
    const { customerId, cart, pricing } = payload;

    const orderNumber = this.generateOrderNumber();

    const order = await tx.order.create({
      data: {
        orderNumber,

        customerId,

        subtotal: pricing.subtotal,
        shippingFee: pricing.shippingFee,
        discountTotal: pricing.discountTotal,
        taxTotal: pricing.taxTotal,
        grandTotal: pricing.grandTotal,

        status: 'PENDING',
        paymentStatus: 'UNPAID',

        items: {
          create: cart.items.map((item: any) => ({
            variantId: item.variantId,

            quantity: item.quantity,

            unitPrice: item.priceSnapshot,

            discount: 0,

            subtotal: Number(item.priceSnapshot) * item.quantity,

            snapshot: {
              productId: item.variant.product.id,

              productName: item.variant.product.productName,

              productImage: item.variant.product.productImage,

              sku: item.variant.sku,

              attributes: item.variant.attributes ?? [],

              brandId: item.variant.product.brandId,

              categoryId: item.variant.product.categoryId,
            },

            cogsSnapshot: item.variant.cogsData ?? {},
          })),
        },

        statusHistory: {
          create: {
            status: 'PENDING',
            changedBy: customerId,
            note: 'Order created',
          },
        },
      },

      include: {
        items: true,
        statusHistory: true,
      },
    });

    return order;
  }

  generateOrderNumber(): string {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, '0');

    const day = String(now.getDate()).padStart(2, '0');

    const timestamp = Date.now().toString().slice(-6);

    return `ORD-${year}${month}${day}-${timestamp}`;
  }

  async confirmOrder(tx: Prisma.TransactionClient, orderId: string) {
    return tx.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',

        statusHistory: {
          create: {
            status: 'CONFIRMED',
            changedBy: 'system',
            note: 'Payment successful',
          },
        },
      },
    });
  }

  async cancelOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
    reason?: string,
  ) {
    return tx.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: 'CANCELLED',
        cancelReason: reason,

        statusHistory: {
          create: {
            status: 'CANCELLED',
            changedBy: 'system',
            note: reason ?? 'Order cancelled',
          },
        },
      },
    });
  }

  async getOrder(orderId: string) {
    return this.prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        items: true,
        payments: true,
        shipment: true,
        statusHistory: true,
        promotions: true,
      },
    });
  }
}
