import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductModule } from './products/product.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { ProductVaraiantModule } from './productVaraiant/productVaraiant.module';
import { AttributeDefinitionModule } from './attributeDefinitions/attributeDefinition.module';
import { EmailsModule } from './emails/emails.module';
import { CogsDefinitionModule } from './cogsDefinitions/cogsDefinition.module';
import { CustomerModule } from './customer/customer.module';
import { InventoryModule } from './inventory/inventory.module';
import { CartModule } from './cart/cart.module';
import { PricingModule } from './pricing/pricing.module';
import { OrderModule } from './order/order.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductModule,
    CategoryModule,
    BrandModule,
    ProductVaraiantModule,
    AttributeDefinitionModule,
    EmailsModule,
    CogsDefinitionModule,
    CustomerModule,
    InventoryModule,
    CartModule,
    PricingModule,
    OrderModule,
    CheckoutModule,
  ],
})
export class AppModule {}
