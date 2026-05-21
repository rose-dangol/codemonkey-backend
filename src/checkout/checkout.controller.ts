import { Body, Controller, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  async checkout(@Body() body: { customerId: string }) {
    return this.checkoutService.checkout(body.customerId);
  }
}
