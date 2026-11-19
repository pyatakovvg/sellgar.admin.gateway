import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { PaginationQueryDto } from '../../shared/presentation/dto/pagination-query.dto';
import { UnitService } from '../application/unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Controller('v2/units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  getAll(@Query() query: PaginationQueryDto) {
    return this.unitService.getAll(query);
  }

  @Get(':code')
  getByCode(@Param('code') code: string) {
    return this.unitService.getByCode(code);
  }

  @Post()
  create(@Body() dto: CreateUnitDto) {
    return this.unitService.create(dto);
  }

  @Patch(':code')
  update(@Param('code') code: string, @Body() dto: UpdateUnitDto) {
    return this.unitService.update(code, dto);
  }
}
