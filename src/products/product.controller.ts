import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { AddProductDto } from './dto/addProduct.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('addProduct')
  @UseInterceptors(FileInterceptor('productImage'))
  async addProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() productDto: AddProductDto,
  ) {
    await this.productService.validateProduct(productDto.productName);
    return this.productService.addProduct(productDto, file);
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
  @UseInterceptors(FileInterceptor('productImage'))
  async updateProduct(
    @Param('id') id: string,
    @Body() productDto: AddProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productService.updateProduct(id, productDto, file);
  }

  @Delete('deleteProduct')
  async deleteProduct(@Body('productId') productId: string[]) {
    return this.productService.deleteProduct(productId);
  }
}
