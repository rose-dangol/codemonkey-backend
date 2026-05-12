import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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

  @Post('addProductVariant')
  async addProductVariant(@Body() body: CreateProductVariantDto) {
    return this.productVaraiantService.addProductVariant(body);
  }

  @Put('updateProductVariant/:id')
  async updateProductVariant(
    @Param('id') id: string,
    @Body() body: CreateProductVariantDto,
  ) {
    return this.productVaraiantService.updateProductVariant(id, body);
  }

  @Delete('deleteProductVariant')
  async deleteProductVariant(@Body() body: { ids: string[] }) {
    return this.productVaraiantService.deleteProductVariant(body.ids);
  }
}
