import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { PropertyEntity, PropertyResultEntity } from '../property.entity';

import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertyService {
  constructor(@Inject('PRODUCT_COMMAND_SERVICE') private readonly productService: ClientProxy) {}

  async findAll() {
    const message = this.productService.send({ cmd: 'property.findAll' }, {});

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(PropertyResultEntity, result, {
      strategy: 'excludeAll',
    });
    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const message = this.productService.send({ cmd: 'property.findByUuid' }, { uuid });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(PropertyEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(uuid: string, dto: UpdatePropertyDto) {
    if (uuid !== dto.uuid) {
      throw Error('Not persistent');
    }

    const message = this.productService.send({ cmd: 'property.update' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(PropertyEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreatePropertyDto) {
    const message = this.productService.send({ cmd: 'property.create' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(PropertyEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
