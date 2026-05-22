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
import { BrandService } from './brand.service';
import { AddBrandDto } from './dto/AddBrandDto';
import { UpdateBrandDto } from './dto/UpdateBrandDto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('brand')
export class BrandController {
  constructor(private brandService: BrandService) {}

  @Post('addBrand')
  @UseInterceptors(FileInterceptor('brandImage'))
  async AddBrand(
    @UploadedFile() file: Express.Multer.File,
    @Body() brandDto: AddBrandDto,
  ) {
    return this.brandService.addBrand(brandDto, file);
  }

  @Put('updateBrand/:id')
  @UseInterceptors(FileInterceptor('brandImage'))
  async UpdateBrand(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') brandId: string,
    @Body() brandDto: UpdateBrandDto,
  ) {
    return this.brandService.updateBrand(brandDto, brandId, file);
  }

  @Get('getBrand')
  async GetBrand() {
    return this.brandService.getBrand();
  }

  @Get('getBrand/:id')
  async GetBrandById(@Param('id') brandId: string) {
    return this.brandService.getBrandById(brandId);
  }

  @Delete('deleteBrand')
  async DeleteBrand(@Body('brandId') brandId: string[]) {
    return this.brandService.deleteBrand(brandId);
  }
}
