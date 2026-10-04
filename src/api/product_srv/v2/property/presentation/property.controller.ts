import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { PaginationQueryDto } from '../../shared/presentation/dto/pagination-query.dto';
import { PropertyService } from '../application/property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { CreatePropertyOptionDto } from './dto/create-property-option.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { UpdatePropertyOptionDto } from './dto/update-property-option.dto';

@Controller('v2/properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  getAll(@Query() query: PaginationQueryDto) {
    return this.propertyService.getAll(query);
  }

  @Get(':code')
  getByCode(@Param('code') code: string) {
    return this.propertyService.getByCode(code);
  }

  @Post()
  create(@Body() dto: CreatePropertyDto) {
    return this.propertyService.create(dto);
  }

  @Patch(':code')
  update(@Param('code') code: string, @Body() dto: UpdatePropertyDto) {
    return this.propertyService.update(code, dto);
  }

  @Post(':code/options')
  createOption(@Param('code') code: string, @Body() dto: CreatePropertyOptionDto) {
    return this.propertyService.createOption(code, dto);
  }

  @Patch(':code/options/:optionCode')
  updateOption(
    @Param('code') code: string,
    @Param('optionCode') optionCode: string,
    @Body() dto: UpdatePropertyOptionDto,
  ) {
    return this.propertyService.updateOption(code, optionCode, dto);
  }
}
