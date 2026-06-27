import { Body, Controller, Get, Delete, Param, Patch, Post } from '@nestjs/common';

import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

import { CurrencyService } from '../service/currency.service';

@Controller('v2/currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('/')
  findAll() {
    return this.currencyService.findAll();
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.currencyService.findByUuid(uuid);
  }

  @Patch(':code')
  update(@Param('code') code: string, @Body() dto: UpdateCurrencyDto) {
    if (code !== dto.code) {
      throw new Error('uuid does not match');
    }
    return this.currencyService.update(dto);
  }

  @Post()
  create(@Body() dto: CreateCurrencyDto) {
    return this.currencyService.create(dto);
  }

  @Delete(':code')
  remove(@Param('code') code: string) {
    return this.currencyService.remove(code);
  }
}
