import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';

import { CartService } from '../application/cart.service';
import { GetAllCartsDto } from './dto/get-all-carts.dto';
import { AddCartItemDto, RemoveCartItemDto, SetCartItemDto } from './dto/cart-item.dto';

@Controller('v1/carts')
export class CartController {
  constructor(private readonly carts: CartService) {}

  @Get()
  getAll(@Query() query: GetAllCartsDto) {
    return this.carts.getAll(query);
  }

  @Get(':uuid')
  getByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.carts.getByUuid(uuid);
  }

  @Post(':uuid/items')
  add(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() input: AddCartItemDto) {
    return this.carts.add(uuid, input);
  }

  @Patch(':uuid/items/:recordUuid')
  setQuantity(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Param('recordUuid', ParseUUIDPipe) recordUuid: string,
    @Body() input: SetCartItemDto,
  ) {
    return this.carts.setQuantity(uuid, recordUuid, input);
  }

  @Delete(':uuid/items/:recordUuid')
  remove(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Param('recordUuid', ParseUUIDPipe) recordUuid: string,
    @Body() input: RemoveCartItemDto,
  ) {
    return this.carts.remove(uuid, recordUuid, input);
  }
}
