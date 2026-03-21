import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { AddCategoryDto } from './dto/addCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('addCategory')
  async AddCategory(@Body() catgoryDto: AddCategoryDto) {
    return this.categoryService.addCategory(catgoryDto);
  }

  @Get('getCategory')
  async GetCategory(catgoryID: null) {
    return this.categoryService.getCategory(null);
  }

  @Get('getCategory/:id')
  async GetCategoryByID(@Param('id') catgoryID: string) {
    return this.categoryService.getCategoryByID(catgoryID);
  }

  @Delete('deleteCategory')
  async DeleteCategory(@Body('categoryId') categoryId: string[]) {
    return this.categoryService.deleteCategory(categoryId);
  }

  @Put('updateCategory/:id')
  async UpdateCategory(
    @Param('id') categoryId: string,
    @Body() categoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(categoryDto, categoryId);
  }
}
