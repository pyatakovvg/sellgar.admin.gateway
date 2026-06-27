import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

import { StoreEntity, StoreResultEntity } from '../store.entity';

@Injectable()
export class StoreGateway {
  constructor(@Inject('PRODUCT_COMMAND_SERVICE') private readonly productProxy: ClientProxy) {}

  async findAll(query: any) {
    const message = this.productProxy.send({ cmd: 'store.getAll' }, { query });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreResultEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const message = this.productProxy.send({ cmd: 'store.getByUuid' }, { uuid });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreateStoreDto) {
    const message = this.productProxy.send({ cmd: 'store.create' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(dto: UpdateStoreDto) {
    const message = this.productProxy.send({ cmd: 'store.update' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
