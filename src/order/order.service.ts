import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}
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

  async getAllOrders(filters?: { customerId?: string; status?: any }) {
    const whereClause: Prisma.OrderWhereInput = {};

    if (filters?.customerId) {
      whereClause.customerId = filters.customerId;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    return this.prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
        payments: true,
        shipment: true,
        statusHistory: true,
        promotions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAnalytics(filters?: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
  }) {
    const whereClause: Prisma.OrderWhereInput = {
      status: {
        not: 'CANCELLED',
      },
    };

    if (filters?.customerId) {
      whereClause.customerId = filters.customerId;
    }

    if (filters?.startDate || filters?.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = new Date(filters.endDate);
      }
    }

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
      },
    });

    const activeFields = await this.prisma.cogsField.findMany({
      where: {
        isActive: true,
      },
    });
    const activeKeysLower = activeFields.map((f) => f.key.toLowerCase());

    let totalSales = 0;
    let totalProfit = 0;
    const totalOrders = orders.length;

    for (const order of orders) {
      totalSales += Number(order.grandTotal);

      for (const item of order.items) {
        const cogsData = (item.cogsSnapshot as Record<string, any>) || {};
        let totalItemCogs = 0;

        const cogsDataLower: Record<string, any> = {};
        for (const [key, val] of Object.entries(cogsData)) {
          if (val !== null && val !== undefined) {
            cogsDataLower[key.toLowerCase()] = val;
          }
        }

        if (activeKeysLower.length > 0) {
          for (const keyLower of activeKeysLower) {
            totalItemCogs += Number(cogsDataLower[keyLower] ?? 0);
          }
        } else {
          totalItemCogs = Number(cogsDataLower['cost'] ?? 0);
        }

        const sellingPrice = Number(item.unitPrice);
        const itemProfit = (sellingPrice - totalItemCogs) * item.quantity;
        totalProfit += itemProfit;
      }
    }

    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    const allOrders = await this.prisma.order.findMany();

    const conversionRate = (totalOrders / allOrders.length) * 100;

    const cancelledOrder = await this.prisma.order.count({
      where: {
        status: 'CANCELLED',
      },
    });

    return {
      totalSales,
      totalProfit,
      totalOrders,
      cancelledOrder,
      conversionRate: Number(conversionRate.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(2)),
    };
  }
}
