import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

import { CreatePriceDto } from './dto/create-price.dto';

import { PriceEntity, PriceResultEntity } from '../price.entity';

@Injectable()
export class PriceGateway {
  constructor(@Inject('PRODUCT_COMMAND_SERVICE') private readonly productProxy: ClientProxy) {}

  async findAll(uuid: string) {
    const message = this.productProxy.send({ cmd: 'store.price.findAll' }, { uuid });
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(PriceResultEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(uuid: string, dto: CreatePriceDto) {
    const message = this.productProxy.send({ cmd: 'store.price.create' }, { uuid, ...dto });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(PriceEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
