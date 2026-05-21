import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/addToCart')
  async addToCart(
    @Body() body: { customerId: string; variantId: string; quantity: number },
  ) {
    return this.cartService.addToCart(
      body.customerId,
      body.variantId,
      body.quantity,
    );
  }

  @Post('/createCart')
  async createCart(@Body() body: { customerId: string }) {
    return this.cartService.createCart(body.customerId);
  }
}
