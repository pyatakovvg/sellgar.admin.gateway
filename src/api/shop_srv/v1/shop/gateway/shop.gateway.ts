import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';

import { ShopEntity, ShopResultEntity } from '../shop.entity';

@Injectable()
export class ShopGateway {
  constructor(@Inject('SHOP_COMMAND_SERVICE') private readonly shopProxy: ClientProxy) {}

  async findAll() {
    const message = this.shopProxy.send({ cmd: 'shop.getAll' }, {});

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ShopResultEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const message = this.shopProxy.send({ cmd: 'shop.getByUuid' }, { uuid });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ShopEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreateDto) {
    const message = this.shopProxy.send({ cmd: 'shop.create' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ShopEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(dto: UpdateDto) {
    const message = this.shopProxy.send({ cmd: 'shop.update' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ShopEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
