import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';

import { PaginationQueryDto } from '../../shared/presentation/dto/pagination-query.dto';
import { ProductTypeService } from '../application/product-type.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';

@Controller('v2/product-types')
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Get()
  getAll(@Query() query: PaginationQueryDto) {
    return this.productTypeService.getAll(query);
  }

  @Get(':uuid')
  getByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.productTypeService.getByUuid(uuid);
  }

  @Post()
  create(@Body() dto: CreateProductTypeDto) {
    return this.productTypeService.create(dto);
  }

  @Patch(':uuid')
  update(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() dto: UpdateProductTypeDto) {
    return this.productTypeService.update(uuid, dto);
  }
}
