import { CartService } from 'src/cart/cart.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { OrderService } from 'src/order/order.service';
import { PricingService } from 'src/pricing/pricing.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private inventoryService: InventoryService,
    private pricingService: PricingService,
    private orderService: OrderService,
  ) {}

  async checkout(
    customerId: string,
    shippingAddressId?: string,
    shippingAddress?: any,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await this.cartService.getCart(customerId);

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      const pricing = this.pricingService.calculate(cart);

      const order = await this.orderService.createOrder(tx, {
        customerId,
        cart,
        pricing,
        shippingAddressId,
        shippingAddress,
      });

      // 🔥 CRITICAL FIX: reserve stock INSIDE transaction
      for (const item of cart.items) {
        await this.inventoryService.reserveStock(tx, {
          variantId: item.variantId,
          quantity: item.quantity,
          referenceId: order.id,
          createdBy: customerId,
        });
      }

      await this.cartService.clearCart(tx, cart.id);

      return order;
    });
  }
}
