import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { firstValueFrom } from 'rxjs';

import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

import { CurrencyEntity, CurrencyResultEntity } from '../currency.entity';

@Injectable()
export class CurrencyGateway {
  constructor(@Inject('STORE_COMMAND_SERVICE') private readonly storeService: ClientProxy) {}

  async findAll() {
    const message = this.storeService.send({ cmd: 'currency.findAll' }, {});
    const result = await firstValueFrom(message);

    const resultInstance = plainToInstance(CurrencyResultEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByCode(code: string) {
    const message = this.storeService.send({ cmd: 'currency.findByUuid' }, { code });
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CurrencyEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(dto: UpdateCurrencyDto) {
    const message = this.storeService.send({ cmd: 'currency.update' }, dto);
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CurrencyEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreateCurrencyDto) {
    const message = this.storeService.send({ cmd: 'currency.create' }, dto);
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CurrencyEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async remove(code: string) {
    const message = this.storeService.send({ cmd: 'currency.delete' }, { code });
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CurrencyEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
