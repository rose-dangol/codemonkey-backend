import { Body, Controller, Get, Post } from "@nestjs/common";
import { BrandService } from "./brand.service";
import { AddBrandDto } from "./dto/AddBrandDto";

@Controller('brand')
export class BrandController {
  constructor(private brandSerivce: BrandService){}

  @Post('addBrand')
    async AddCategory(@Body() brandDto: AddBrandDto){
      return this.brandSerivce.addBrand(brandDto)
    }

  @Get('getBrand')
    async GetBrand(){
      return this.brandSerivce.getBrand()
    }
  
  }