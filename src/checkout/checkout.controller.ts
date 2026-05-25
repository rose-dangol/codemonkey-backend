import { Body, Controller, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  async checkout(@Body() body: CheckoutDto) {
    return this.checkoutService.checkout(
      body.customerId,
      body.shippingAddressId,
      body.shippingAddress,
    );
  }
}

