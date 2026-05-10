import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { BrandService } from "./brand.service";
import { AddBrandDto } from "./dto/AddBrandDto";
import { UpdateBrandDto } from "./dto/UpdateBrandDto";

@Controller('brand')
export class BrandController {
  constructor(private brandSerivce: BrandService) { }

  @Post('addBrand')
  async AddBrand(@Body() brandDto: AddBrandDto) {
    return this.brandSerivce.addBrand(brandDto)
  }

  @Put('updateBrand/:id')
  async UpdateBrand(
    @Param('id') brandId: string,
    @Body() brandDto: UpdateBrandDto,
  ) {
    return this.brandSerivce.updateBrand(brandDto, brandId);
  }


  @Get('getBrand')
  async GetBrand() {
    return this.brandSerivce.getBrand()
  }


  @Get('getBrand/:id')
  async GetBrandById(@Param('id') brandId: string) {
    return this.brandSerivce.getBrandById(brandId)
  }

}