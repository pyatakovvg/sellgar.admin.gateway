import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { BrandService } from '../service/brand.service';

import { UpdateBrandDto } from '../service/dto/update-brand.dto';
import { CreateBrandDto } from '../service/dto/create-brand.dto';

@Controller('v2/brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get('/')
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.brandService.findByUuid(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() updateCategoryDto: UpdateBrandDto) {
    return this.brandService.update(uuid, updateCategoryDto);
  }

  @Post()
  create(@Body() createCategoryDto: CreateBrandDto) {
    return this.brandService.create(createCategoryDto);
  }
}
