import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { PropertyService } from '../service/property.service';

import { UpdatePropertyDto } from '../service/dto/update-property.dto';
import { CreatePropertyDto } from '../service/dto/create-property.dto';

@Controller('v2/properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get('/')
  findAll() {
    return this.propertyService.findAll();
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.propertyService.findByUuid(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() dto: UpdatePropertyDto) {
    return this.propertyService.update(uuid, dto);
  }

  @Post()
  create(@Body() dto: CreatePropertyDto) {
    return this.propertyService.create(dto);
  }
}
