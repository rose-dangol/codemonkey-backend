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
import { CategoryService } from './category.service';
import { AddCategoryDto } from './dto/addCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('addCategory')
  @UseInterceptors(FileInterceptor('categoryImage'))
  async AddCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() categoryDto: AddCategoryDto,
  ) {
    return this.categoryService.addCategory(categoryDto, file);
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
  @UseInterceptors(FileInterceptor('categoryImage'))
  async UpdateCategory(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') categoryId: string,
    @Body() categoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(categoryDto, categoryId, file);
  }
}
