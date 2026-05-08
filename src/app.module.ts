import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductModule } from './products/product.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { ProductVaraiantModule } from './productVaraiant/productVaraiant.module';
import { AttributeDefinitionModule } from './attributeDefinitions/attributeDefinition.module';

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
  ],
})
export class AppModule {}
