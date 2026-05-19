import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CartModule } from 'src/cart/cart.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { PricingModule } from 'src/pricing/pricing.module';
import { OrderModule } from 'src/order/order.module';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';

@Module({
  imports: [PrismaModule, CartModule, InventoryModule, PricingModule, OrderModule],
  providers: [CheckoutService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
