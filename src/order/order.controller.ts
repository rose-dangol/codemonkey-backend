import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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

  @Post('/:id/confirm')
  async confirmOrder(@Param('id') id: string) {
    return this.orderService.confirmOrder(this.prisma, id);
  }

  @Post('/:id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.orderService.cancelOrder(this.prisma, id, body.reason);
  }
}
