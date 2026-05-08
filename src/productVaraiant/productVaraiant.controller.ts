import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductVaraiantService } from './productVaraiant.service';
import { CreateProductVariantDto } from './dto/productVaraiant.dto';

@Controller('productVariant')
export class ProductVaraiantController {
  constructor(
    private readonly productVaraiantService: ProductVaraiantService,
  ) {}

  @Get('getAll')
  async getAllProductVariant() {
    return this.productVaraiantService.getAllProductVariant();
  }

  @Post('create')
  async addProductVariant(@Body() body: CreateProductVariantDto) {
    return this.productVaraiantService.addProductVariant(body);
  }
}
