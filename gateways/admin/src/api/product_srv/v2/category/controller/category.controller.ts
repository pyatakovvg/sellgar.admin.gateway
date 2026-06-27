import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { CategoryService } from '../service/category.service';

import { UpdateCategoryDto } from '../service/dto/update-category.dto';
import { CreateCategoryDto } from '../service/dto/create-category.dto';

@Controller('v2/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.categoryService.findByUuid(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(uuid, updateCategoryDto);
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }
}
