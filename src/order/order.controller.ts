import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getAllOrders(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    return this.orderService.getAllOrders({ customerId, status });
  }

  @Get('/analytics')
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.orderService.getAnalytics({ startDate, endDate, customerId });
  }

  @Get('/revenue-chart')
  async getRevenueChartData(
    @Query('groupBy') groupBy: 'day' | 'month' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.orderService.getRevenueChartData({
      startDate,
      endDate,
      customerId,
      groupBy,
    });
  }

  @Get('/order-chart')
  async getOrderChartData(
    @Query('groupBy') groupBy: 'day' | 'month' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.orderService.getOrderChartData({
      startDate,
      endDate,
      customerId,
      groupBy,
    });
  }

  @Get('/:id')
  async getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  // ─── Order Status Endpoints ────────────────────────────────────────────────

  @Post('/:id/confirm')
  async confirmOrder(@Param('id') id: string) {
    return this.orderService.confirmOrder(this.prisma, id);
  }

  @Post('/:id/process')
  async processOrder(@Param('id') id: string) {
    return this.orderService.processOrder(this.prisma, id);
  }

  @Post('/:id/ship')
  async shipOrder(@Param('id') id: string, @Body() body: { note?: string }) {
    return this.orderService.shipOrder(this.prisma, id, body.note);
  }

  @Post('/:id/deliver')
  async deliverOrder(@Param('id') id: string, @Body() body: { note?: string }) {
    return this.orderService.deliverOrder(this.prisma, id, body.note);
  }

  @Post('/:id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.orderService.cancelOrder(this.prisma, id, body.reason);
  }

  @Post('/:id/refund')
  async refundOrder(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.orderService.refundOrder(this.prisma, id, body.reason);
  }

  // ─── Payment Status Endpoints ──────────────────────────────────────────────

  @Post('/:id/payment/awaiting-verification')
  async markPaymentAwaitingVerification(
    @Param('id') id: string,
    @Body() body: { note?: string },
  ) {
    return this.orderService.markPaymentAwaitingVerification(
      this.prisma,
      id,
      body.note,
    );
  }

  @Post('/:id/payment/failed')
  async markPaymentFailed(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.orderService.markPaymentFailed(this.prisma, id, body.reason);
  }

  @Post('/:id/payment/partially-refunded')
  async markPartiallyRefunded(
    @Param('id') id: string,
    @Body() body: { note?: string },
  ) {
    return this.orderService.markPartiallyRefunded(this.prisma, id, body.note);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  @Delete('/deleteOrder')
  async deleteOrder(@Body('orderIds') orderIds: string[]) {
    return this.orderService.deleteOrder(orderIds);
  }
}
