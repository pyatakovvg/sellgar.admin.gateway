import { Injectable } from '@nestjs/common';

import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CreateCurrencyDto } from './dto/create-currency.dto';

import { CurrencyGateway } from '../gateway/currency.gateway';

@Injectable()
export class CurrencyService {
  constructor(private readonly currencyGateway: CurrencyGateway) {}

  async findAll() {
    return await this.currencyGateway.findAll();
  }

  async findByUuid(code: string) {
    return await this.currencyGateway.findByUuid(code);
  }

  async update(dto: UpdateCurrencyDto) {
    return await this.currencyGateway.update(dto);
  }

  async create(dto: CreateCurrencyDto) {
    return await this.currencyGateway.create(dto);
  }

  async remove(code: string) {
    return await this.currencyGateway.remove(code);
  }
}
