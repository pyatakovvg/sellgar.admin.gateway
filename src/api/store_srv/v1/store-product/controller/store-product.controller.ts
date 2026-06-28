import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { ArchiveStoreProductDto } from '../service/dto/archive-store-product.dto';
import { CreateStoreProductDto } from '../service/dto/create-store-product.dto';
import { StoreProductService } from '../service/store-product.service';
import { UpdateStoreProductDto } from '../service/dto/update-store-product.dto';

@Controller('v2/store/products')
export class StoreProductController {
  constructor(private readonly storeProductService: StoreProductService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.storeProductService.findAll(query);
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.storeProductService.findByUuid(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() dto: UpdateStoreProductDto) {
    return this.storeProductService.update({ uuid, ...dto });
  }

  @Patch(':uuid/archive')
  archive(@Param('uuid') uuid: string, @Body() dto: ArchiveStoreProductDto) {
    return this.storeProductService.archive({ uuid, ...dto });
  }

  @Post()
  create(@Body() dto: CreateStoreProductDto) {
    return this.storeProductService.create(dto);
  }
}
