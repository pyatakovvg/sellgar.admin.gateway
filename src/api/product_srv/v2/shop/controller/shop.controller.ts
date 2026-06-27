import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { UpdateDto } from '../service/dto/update.dto';
import { CreateDto } from '../service/dto/create.dto';

import { ShopService } from '../service/shop.service';

@Controller('v2/shops')
export class ShopController {
  constructor(private readonly productService: ShopService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.productService.findByUuid(uuid);
  }

  @Patch(':uuid')
  update(@Body() dto: UpdateDto) {
    return this.productService.update(dto);
  }

  @Post()
  create(@Body() dto: CreateDto) {
    return this.productService.create(dto);
  }
}
