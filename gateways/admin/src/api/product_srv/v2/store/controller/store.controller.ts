import { Body, Controller, Get, Param, Query, Patch, Post } from '@nestjs/common';

import { StoreService } from '../service/store.service';
import { UpdateStoreDto } from '../service/dto/update-store.dto';
import { CreateStoreDto } from '../service/dto/create-store.dto';
import { CreatePriceDto } from '../../price/gateway/dto/create-price.dto';

import { PriceService } from '../../price/service/price.service';

@Controller('v2/store')
export class StoreController {
  constructor(
    private readonly priceService: PriceService,
    private readonly storeService: StoreService,
  ) {}

  @Get()
  findAll(@Query() query: any) {
    return this.storeService.findAll(query);
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.storeService.findByUuid(uuid);
  }

  @Patch()
  update(@Body() dto: UpdateStoreDto) {
    return this.storeService.update(dto);
  }

  @Post()
  create(@Body() dto: CreateStoreDto) {
    return this.storeService.create(dto);
  }

  @Get(':uuid/prices')
  priceFindAll(@Param('uuid') uuid: string) {
    return this.priceService.findAll(uuid);
  }

  @Post(':uuid/prices')
  priceCreate(@Param('uuid') uuid: string, @Body() dto: CreatePriceDto) {
    return this.priceService.create(uuid, dto);
  }
}
