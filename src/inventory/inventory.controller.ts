import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { InventoryTransactionType } from '@prisma/client';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getInventoryList() {
    return this.inventoryService.getInventoryList();
  }

  @Get(':variantId')
  getVariantInventoryDetail(@Param('variantId') variantId: string) {
    return this.inventoryService.getVariantInventoryDetail(variantId);
  }

  @Get('transactions/all')
  getInventoryTransactions(
    @Query('variantId') variantId?: string,
    @Query('type') type?: InventoryTransactionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.inventoryService.getInventoryTransactions({
      variantId,
      type,
      startDate,
      endDate,
    });
  }

  @Post('restock')
  restock(
    @Body()
    body: {
      variantId: string;
      quantity: number;
      referenceId?: string;
      createdBy?: string;
    },
  ) {
    return this.prisma.$transaction((tx) =>
      this.inventoryService.restock(tx, body),
    );
  }

  @Post('damage')
  markDamage(
    @Body()
    body: {
      variantId: string;
      quantity: number;
      referenceId?: string;
      note?: string;
      createdBy?: string;
    },
  ) {
    return this.prisma.$transaction((tx) =>
      this.inventoryService.markDamage(tx, body),
    );
  }

  @Patch('adjust')
  adjustStock(
    @Body()
    body: {
      variantId: string;
      newStock: number;
      reason?: string;
      referenceId?: string;
      createdBy?: string;
    },
  ) {
    return this.prisma.$transaction((tx) =>
      this.inventoryService.adjustStock(tx, body),
    );
  }
}
