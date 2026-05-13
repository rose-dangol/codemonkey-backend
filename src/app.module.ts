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
  ],
})
export class AppModule {}
