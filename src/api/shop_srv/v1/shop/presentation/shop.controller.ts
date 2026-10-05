import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';

import { ShopService } from '../application/shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { GetAllShopsDto } from './dto/get-all-shops.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Controller('v2/shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  getAll(@Query() query: GetAllShopsDto) {
    return this.shopService.getAll(query);
  }

  @Get(':uuid')
  getByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.shopService.getByUuid(uuid);
  }

  @Post()
  create(@Body() dto: CreateShopDto) {
    return this.shopService.create(dto);
  }

  @Patch(':uuid')
  update(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() dto: UpdateShopDto) {
    return this.shopService.update(uuid, dto);
  }
}
