import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { UnitService } from '../service/unit.service';

import { UpdateUnitDto } from '../service/dto/update-unit.dto';
import { CreateUnitDto } from '../service/dto/create-unit.dto';

@Controller('v2/units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get('/')
  findAll() {
    return this.unitService.findAll();
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.unitService.findByUuid(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() updateCategoryDto: UpdateUnitDto) {
    return this.unitService.update(uuid, updateCategoryDto);
  }

  @Post()
  create(@Body() createCategoryDto: CreateUnitDto) {
    return this.unitService.create(createCategoryDto);
  }
}
