import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';

import { CategoryGateway } from '../gateway/category.gateway';
import { GetCategoryTreeDto } from './dto/get-category-tree.dto';

@Controller('v2/store/categories')
export class CategoryController {
  constructor(private readonly gateway: CategoryGateway) {}

  @Post()
  create(@Body() input: CreateCategoryDto) {
    return this.gateway.create(input);
  }

  @Patch(':uuid')
  update(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() input: UpdateCategoryDto) {
    return this.gateway.update(uuid, input);
  }

  @Get('tree')
  getTree(@Query() query: GetCategoryTreeDto) {
    return this.gateway.getTree(query.shopUuid);
  }
  @Get(':uuid')
  getByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.gateway.getByUuid(uuid);
  }
}
