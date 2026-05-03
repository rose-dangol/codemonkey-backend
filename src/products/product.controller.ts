import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { AddProductDto } from './dto/addProduct.dto';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('addProduct')
  async addProduct(@Body() productDto: AddProductDto) {
    await this.productService.validateProduct(productDto.productName);
    return this.productService.addProduct(productDto);
  }

  @Get('getProductById/:id')
  async getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Get('getProduct')
  async getProduct() {
    return this.productService.getProduct();
  }
  
  
  @Get('getAllProduct')
  async getAllProduct() {
    return this.productService.getAllProduct();
  }
  

  @Put('updateProduct/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() productDto: AddProductDto,
  ) {
    return this.productService.updateProduct(id, productDto);
  }

  @Delete('deleteProduct')
  async deleteProduct(@Body('ids') ids: string[]) {
    return this.productService.deleteProduct(ids);
  }
}
