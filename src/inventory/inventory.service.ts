import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma, InventoryTransactionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getInventoryList() {
    return this.prisma.productVariant.findMany({
      include: {
        product: true,
        attributes: {
          include: {
            attribute: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getVariantInventoryDetail(variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
        attributes: {
          include: { attribute: true },
        },
      },
    });

    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      variant,
      transactions,
    };
  }

  async getInventoryTransactions(filters?: {
    variantId?: string;
    type?: InventoryTransactionType;
    startDate?: string;
    endDate?: string;
  }) {
    return this.prisma.inventoryTransaction.findMany({
      where: {
        variantId: filters?.variantId,
        type: filters?.type,
        createdAt: {
          gte: filters?.startDate ? new Date(filters.startDate) : undefined,
          lte: filters?.endDate ? new Date(filters.endDate) : undefined,
        },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ============================================================
  // CORE: GET VARIANT WITH LOCK (prevents race conditions)
  // ============================================================
  async getVariantForUpdate(tx: Prisma.TransactionClient, variantId: string) {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new BadRequestException('Product variant not found');
    }

    return variant;
  }

  // ============================================================
  // RESERVE STOCK (checkout phase)
  // ============================================================
  async reserveStock(
    tx: Prisma.TransactionClient,
    payload: {
      variantId: string;
      quantity: number;
      referenceId: string;
      createdBy?: string;
    },
  ) {
    const { variantId, quantity, referenceId, createdBy } = payload;

    const variant = await this.getVariantForUpdate(tx, variantId);

    if (quantity <= 0) {
      throw new BadRequestException('Invalid quantity');
    }

    if (variant.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for variant ${variantId}`,
      );
    }

    const newStock = variant.stock - quantity;

    await tx.productVariant.update({
      where: { id: variantId },
      data: {
        stock: newStock,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        variantId,
        type: InventoryTransactionType.RESERVE,
        quantity,
        previousStock: variant.stock,
        newStock,
        referenceId,
        referenceType: 'order',
        createdBy,
      },
    });

    return { variantId, reserved: quantity, newStock };
  }

  // ============================================================
  // RELEASE STOCK (order cancelled / payment failed)
  // ============================================================
  async releaseStock(
    tx: Prisma.TransactionClient,
    payload: {
      variantId: string;
      quantity: number;
      referenceId: string;
      createdBy?: string;
    },
  ) {
    const { variantId, quantity, referenceId, createdBy } = payload;

    const variant = await this.getVariantForUpdate(tx, variantId);

    const newStock = variant.stock + quantity;

    await tx.productVariant.update({
      where: { id: variantId },
      data: {
        stock: newStock,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        variantId,
        type: InventoryTransactionType.RELEASE,
        quantity,
        previousStock: variant.stock,
        newStock,
        referenceId,
        referenceType: 'order',
        createdBy,
      },
    });

    return { variantId, released: quantity, newStock };
  }

  // ============================================================
  // CONFIRM SALE (audit only - stock already reserved)
  // ============================================================
  async confirmSale(
    tx: Prisma.TransactionClient,
    payload: {
      variantId: string;
      quantity: number;
      referenceId: string;
      createdBy?: string;
    },
  ) {
    const { variantId, quantity, referenceId, createdBy } = payload;

    const variant = await this.getVariantForUpdate(tx, variantId);

    await tx.inventoryTransaction.create({
      data: {
        variantId,
        type: InventoryTransactionType.SALE,
        quantity,
        previousStock: variant.stock,
        newStock: variant.stock,
        referenceId,
        referenceType: 'order',
        createdBy,
      },
    });

    return { variantId, sold: quantity };
  }

  // ============================================================
  // RETURN STOCK (customer return)
  // ============================================================
  async returnStock(
    tx: Prisma.TransactionClient,
    payload: {
      variantId: string;
      quantity: number;
      referenceId: string;
      createdBy?: string;
    },
  ) {
    const { variantId, quantity, referenceId, createdBy } = payload;

    const variant = await this.getVariantForUpdate(tx, variantId);

    const newStock = variant.stock + quantity;

    await tx.productVariant.update({
      where: { id: variantId },
      data: {
        stock: newStock,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        variantId,
        type: InventoryTransactionType.RETURN,
        quantity,
        previousStock: variant.stock,
        newStock,
        referenceId,
        referenceType: 'return',
        createdBy,
      },
    });

    return { variantId, returned: quantity, newStock };
  }

  // ============================================================
  // RESTOCK (supplier / admin add stock)
  // ============================================================
  async restock(
    tx: Prisma.TransactionClient,
    payload: {
      variantId: string;
      quantity: number;
      referenceId?: string;
      createdBy?: string;
    },
  ) {
    const { variantId, quantity, referenceId, createdBy } = payload;

    const variant = await this.getVariantForUpdate(tx, variantId);

    const newStock = variant.stock + quantity;

    await tx.productVariant.update({
      where: { id: variantId },
      data: {
        stock: newStock,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        variantId,
        type: InventoryTransactionType.RESTOCK,
        quantity,
        previousStock: variant.stock,
        newStock,
        referenceId,
        referenceType: 'restock',
        createdBy,
      },
    });

    return { variantId, restocked: quantity, newStock };
  }

  // ============================================================
  // DAMAGE / LOSS
  // ============================================================
  async markDamage(
    tx: Prisma.TransactionClient,
    payload: {
      variantId: string;
      quantity: number;
      referenceId?: string;
      note?: string;
      createdBy?: string;
    },
  ) {
    const { variantId, quantity, referenceId, note, createdBy } = payload;

    const variant = await this.getVariantForUpdate(tx, variantId);

    if (variant.stock < quantity) {
      throw new BadRequestException('Not enough stock to mark as damage');
    }

    const newStock = variant.stock - quantity;

    await tx.productVariant.update({
      where: { id: variantId },
      data: {
        stock: newStock,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        variantId,
        type: InventoryTransactionType.DAMAGE,
        quantity,
        previousStock: variant.stock,
        newStock,
        referenceId,
        referenceType: 'manual_adjustment',
        note,
        createdBy,
      },
    });

    return { variantId, damaged: quantity, newStock };
  }

  // ============================================================
  // MANUAL ADJUSTMENT (admin override)
  // ============================================================
  async adjustStock(
    tx: Prisma.TransactionClient,
    payload: {
      variantId: string;
      newStock: number;
      reason?: string;
      referenceId?: string;
      createdBy?: string;
    },
  ) {
    const { variantId, newStock, referenceId, createdBy, reason } = payload;

    const variant = await this.getVariantForUpdate(tx, variantId);

    const oldStock = variant.stock;

    await tx.productVariant.update({
      where: { id: variantId },
      data: {
        stock: newStock,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        variantId,
        type: InventoryTransactionType.ADJUSTMENT,
        quantity: Math.abs(newStock - oldStock),
        previousStock: oldStock,
        newStock,
        referenceId,
        referenceType: 'manual_adjustment',
        note: reason,
        createdBy,
      },
    });

    return { variantId, oldStock, newStock };
  }
}
