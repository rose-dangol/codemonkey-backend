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
      shippingAddressId?: string;
      shippingAddress?: {
        label?: string;
        recipientName: string;
        phone: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country?: string;
      };
    },
  ) {
    const { customerId, cart, pricing, shippingAddressId, shippingAddress } =
      payload;

    const orderNumber = this.generateOrderNumber();
    let finalShippingAddressId: string | undefined = undefined;
    let shippingSnapshot: any = null;
    if (shippingAddressId) {
      const address = await tx.customerAddress.findFirst({
        where: { id: shippingAddressId, customerId },
      });
      if (address) {
        finalShippingAddressId = address.id;
        shippingSnapshot = address;
      }
    } else if (shippingAddress) {
      // Automatically save new address for the customer
      const createdAddress = await tx.customerAddress.create({
        data: {
          customerId,
          label: shippingAddress.label || 'Shipping Address',
          recipientName: shippingAddress.recipientName,
          phone: shippingAddress.phone,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country || 'ID',
          isDefault: false,
        },
      });
      finalShippingAddressId = createdAddress.id;
      shippingSnapshot = createdAddress;
    }

    const order = await tx.order.create({
      data: {
        orderNumber,

        customerId,

        shippingAddressId: finalShippingAddressId,
        shippingSnapshot,

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
        shippingAddress: true,
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
      where: { id: orderId },
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

  async processOrder(tx: Prisma.TransactionClient, orderId: string) {
    return tx.order.update({
      where: { id: orderId },
      data: {
        status: 'PROCESSING',
        statusHistory: {
          create: {
            status: 'PROCESSING',
            changedBy: 'system',
            note: 'Order is being processed',
          },
        },
      },
    });
  }

  async shipOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
    note?: string,
  ) {
    return tx.order.update({
      where: { id: orderId },
      data: {
        status: 'SHIPPED',
        statusHistory: {
          create: {
            status: 'SHIPPED',
            changedBy: 'system',
            note: note ?? 'Order has been shipped',
          },
        },
      },
    });
  }

  async deliverOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
    note?: string,
  ) {
    return tx.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        statusHistory: {
          create: {
            status: 'DELIVERED',
            changedBy: 'system',
            note: note ?? 'Order delivered successfully',
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
      where: { id: orderId },
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

  async refundOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
    reason?: string,
  ) {
    return tx.order.update({
      where: { id: orderId },
      data: {
        status: 'REFUNDED',
        paymentStatus: 'REFUNDED',
        statusHistory: {
          create: {
            status: 'REFUNDED',
            changedBy: 'system',
            note: reason ?? 'Order refunded',
          },
        },
      },
    });
  }

  // ─── Payment status methods ───────────────────────────────────────────────────

  async markPaymentAwaitingVerification(
    tx: Prisma.TransactionClient,
    orderId: string,
    note?: string,
  ) {
    return tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'AWAITING_VERIFICATION',
        statusHistory: {
          create: {
            status: 'PENDING', // order status unchanged
            changedBy: 'system',
            note: note ?? 'Payment submitted, awaiting verification',
          },
        },
      },
    });
  }

  async markPaymentFailed(
    tx: Prisma.TransactionClient,
    orderId: string,
    reason?: string,
  ) {
    return tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'FAILED',
        statusHistory: {
          create: {
            status: 'PENDING', // order status unchanged — can be retried
            changedBy: 'system',
            note: reason ?? 'Payment failed',
          },
        },
      },
    });
  }

  async markPartiallyRefunded(
    tx: Prisma.TransactionClient,
    orderId: string,
    note?: string,
  ) {
    return tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PARTIALLY_REFUNDED',
        statusHistory: {
          create: {
            status: 'DELIVERED', // order was delivered; only payment status changes
            changedBy: 'system',
            note: note ?? 'Partial refund issued',
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

  // async getRevenueChartData(filters?: {
  //   startDate?: string;
  //   endDate?: string;
  //   customerId?: string;
  //   groupBy?: 'day' | 'month' | 'year';
  // }) {
  //   const whereClause: Prisma.OrderWhereInput = {
  //     status: { not: 'CANCELLED' },
  //   };

  //   if (filters?.customerId) {
  //     whereClause.customerId = filters.customerId;
  //   }

  //   if (filters?.startDate || filters?.endDate) {
  //     whereClause.createdAt = {};

  //     if (filters.startDate) {
  //       whereClause.createdAt.gte = new Date(filters.startDate);
  //     }

  //     if (filters.endDate) {
  //       whereClause.createdAt.lte = new Date(filters.endDate);
  //     }
  //   }

  //   const orders = await this.prisma.order.findMany({
  //     where: whereClause,
  //     include: { items: true },
  //     orderBy: { createdAt: 'asc' },
  //   });

  //   const activeFields = await this.prisma.cogsField.findMany({
  //     where: { isActive: true },
  //   });

  //   const activeKeysLower = activeFields.map((f) => f.key.toLowerCase());

  //   const start = filters?.startDate
  //     ? new Date(filters.startDate)
  //     : new Date(new Date().getFullYear(), 0, 1);

  //   const end = filters?.endDate ? new Date(filters.endDate) : new Date();

  //   const groupBy = filters?.groupBy ?? 'month';

  //   const pad = (n: number) => String(n).padStart(2, '0');

  //   const formatKey = (date: Date) => {
  //     const y = date.getUTCFullYear();
  //     const m = pad(date.getUTCMonth() + 1);
  //     const d = pad(date.getUTCDate());

  //     if (groupBy === 'day') return `${y}-${m}-${d}`;
  //     if (groupBy === 'year') return `${y}`;
  //     return `${y}-${m}`;
  //   };

  //   const dataMap: Record<string, { revenue: number; profit: number }> = {};

  //   const cursor = new Date(start);
  //   const endCursor = new Date(end);

  //   while (cursor <= endCursor) {
  //     const key = formatKey(cursor);
  //     dataMap[key] = { revenue: 0, profit: 0 };

  //     if (groupBy === 'day') cursor.setUTCDate(cursor.getUTCDate() + 1);
  //     else if (groupBy === 'year')
  //       cursor.setUTCFullYear(cursor.getUTCFullYear() + 1);
  //     else cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  //   }

  //   for (const order of orders) {
  //     const key = formatKey(order.createdAt);

  //     if (!dataMap[key]) {
  //       dataMap[key] = { revenue: 0, profit: 0 };
  //     }

  //     dataMap[key].revenue += Number(order.grandTotal);

  //     for (const item of order.items) {
  //       const cogsData = (item.cogsSnapshot as Record<string, any>) || {};

  //       const normalized: Record<string, number> = {};
  //       for (const [k, v] of Object.entries(cogsData)) {
  //         if (v != null) normalized[k.toLowerCase()] = Number(v);
  //       }

  //       let totalCogs = 0;

  //       if (activeKeysLower.length > 0) {
  //         for (const k of activeKeysLower) {
  //           totalCogs += normalized[k] ?? 0;
  //         }
  //       } else {
  //         totalCogs = normalized['cost'] ?? 0;
  //       }

  //       const profit = (Number(item.unitPrice) - totalCogs) * item.quantity;

  //       dataMap[key].profit += profit;
  //     }
  //   }

  //   return Object.entries(dataMap).map(([date, value]) => ({
  //     date,
  //     revenue: Number(value.revenue.toFixed(2)),
  //     profit: Number(value.profit.toFixed(2)),
  //   }));
  // }

  async getRevenueChartData(filters?: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
    groupBy?: 'day' | 'month' | 'year';
  }) {
    const whereClause: Prisma.OrderWhereInput = {
      status: { not: 'CANCELLED' },
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
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    const activeFields = await this.prisma.cogsField.findMany({
      where: { isActive: true },
    });

    const activeKeysLower = activeFields.map((f) => f.key.toLowerCase());

    const start = filters?.startDate
      ? new Date(filters.startDate)
      : new Date(new Date().getFullYear(), 0, 1);

    const end = filters?.endDate ? new Date(filters.endDate) : new Date();

    const groupBy = filters?.groupBy ?? 'month';

    const pad = (n: number) => String(n).padStart(2, '0');

    const formatKey = (date: Date) => {
      const y = date.getUTCFullYear();
      const m = pad(date.getUTCMonth() + 1);
      const d = pad(date.getUTCDate());

      if (groupBy === 'day') return `${y}-${m}-${d}`;
      if (groupBy === 'year') return `${y}`;
      return `${y}-${m}`;
    };

    const dataMap: Record<string, { revenue: number; profit: number }> = {};

    const cursor = new Date(start);
    const endCursor = new Date(end);

    while (cursor <= endCursor) {
      const key = formatKey(cursor);
      dataMap[key] = { revenue: 0, profit: 0 };

      if (groupBy === 'day') cursor.setUTCDate(cursor.getUTCDate() + 1);
      else if (groupBy === 'year')
        cursor.setUTCFullYear(cursor.getUTCFullYear() + 1);
      else cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }

    for (const order of orders) {
      const key = formatKey(order.createdAt);

      if (!dataMap[key]) {
        dataMap[key] = { revenue: 0, profit: 0 };
      }

      dataMap[key].revenue += Number(order.grandTotal);

      for (const item of order.items) {
        const cogsData = (item.cogsSnapshot as Record<string, any>) || {};

        const normalized: Record<string, number> = {};
        for (const [k, v] of Object.entries(cogsData)) {
          if (v != null) normalized[k.toLowerCase()] = Number(v);
        }

        let totalCogs = 0;

        if (activeKeysLower.length > 0) {
          for (const k of activeKeysLower) {
            totalCogs += normalized[k] ?? 0;
          }
        } else {
          totalCogs = normalized['cost'] ?? 0;
        }

        const profit = (Number(item.unitPrice) - totalCogs) * item.quantity;

        dataMap[key].profit += profit;
      }
    }

    return Object.entries(dataMap).map(([date, value]) => {
      let label: string;

      switch (groupBy) {
        case 'day':
          const [y, m, d] = date.split('-').map(Number);
          label = new Date(y, m - 1, d).toLocaleDateString('en-US', {
            weekday: 'long',
          });
          break;
        case 'month':
          label = new Date(date + '-01').toLocaleDateString('en-US', {
            month: 'short',
          });
          break;
        case 'year':
          label = date;
          break;
        default:
          label = date;
      }

      return {
        [groupBy]: label,
        revenue: Number(value.revenue.toFixed(2)),
        profit: Number(value.profit.toFixed(2)),
      };
    });
  }

  async getOrderChartData(filters?: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
    groupBy?: 'day' | 'month' | 'year';
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    const start = filters?.startDate
      ? new Date(filters.startDate)
      : new Date(new Date().getFullYear(), 0, 1);

    const end = filters?.endDate ? new Date(filters.endDate) : new Date();

    const groupBy = filters?.groupBy ?? 'month';

    const pad = (n: number) => String(n).padStart(2, '0');

    const formatKey = (date: Date) => {
      const y = date.getUTCFullYear();
      const m = pad(date.getUTCMonth() + 1);
      const d = pad(date.getUTCDate());

      if (groupBy === 'day') return `${y}-${m}-${d}`;
      if (groupBy === 'year') return `${y}`;

      return `${y}-${m}`;
    };

    const dataMap: Record<string, { orders: number; cancelled: number }> = {};

    const cursor = new Date(start);
    const endCursor = new Date(end);

    // Fill empty periods
    while (cursor <= endCursor) {
      const key = formatKey(cursor);

      dataMap[key] = {
        orders: 0,
        cancelled: 0,
      };

      if (groupBy === 'day') {
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      } else if (groupBy === 'year') {
        cursor.setUTCFullYear(cursor.getUTCFullYear() + 1);
      } else {
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
    }

    // Populate data
    for (const order of orders) {
      const key = formatKey(order.createdAt);

      if (!dataMap[key]) {
        dataMap[key] = {
          orders: 0,
          cancelled: 0,
        };
      }

      dataMap[key].orders += 1;

      if (order.status === 'CANCELLED') {
        dataMap[key].cancelled += 1;
      }
    }

    return Object.entries(dataMap).map(([date, data]) => {
      let label: string;

      switch (groupBy) {
        case 'day': {
          const [y, m, d] = date.split('-').map(Number);

          label = new Date(y, m - 1, d).toLocaleDateString('en-US', {
            weekday: 'long',
          });

          break;
        }

        case 'month':
          label = new Date(date + '-01').toLocaleDateString('en-US', {
            month: 'short',
          });
          break;

        case 'year':
          label = date;
          break;

        default:
          label = date;
      }

      return {
        [groupBy]: label,
        orders: data.orders,
        cancelled: data.cancelled,
      };
    });
  }

  async deleteOrder(orderIds: string[]) {
    return this.prisma.order.deleteMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });
  }
}
