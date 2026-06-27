import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CreateCurrencyDto } from './dto/create-currency.dto';

import { CurrencyEntity, CurrencyResultEntity } from '../currency.entity';

@Injectable()
export class CurrencyGateway {
  constructor(@Inject('PRODUCT_COMMAND_SERVICE') private readonly productService: ClientProxy) {}

  async findAll() {
    const message = this.productService.send({ cmd: 'currency.findAll' }, {});
    const result = await firstValueFrom(message);

    const resultInstance = plainToInstance(CurrencyResultEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(code: string) {
    const message = this.productService.send({ cmd: 'currency.findByUuid' }, { code });
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CurrencyEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(dto: UpdateCurrencyDto) {
    const message = this.productService.send({ cmd: 'currency.update' }, dto);
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CurrencyEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreateCurrencyDto) {
    const message = this.productService.send({ cmd: 'currency.create' }, dto);
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CurrencyEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async remove(code: string) {
    const message = this.productService.send({ cmd: 'currency.delete' }, { code });
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CurrencyEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
