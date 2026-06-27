import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { PropertyGroupEntity, PropertyGroupResultEntity } from '../property-group.entity';

import { UpdatePropertyGroupDto } from './dto/update-property-group.dto';
import { CreatePropertyGroupDto } from './dto/create-property-group.dto';

@Injectable()
export class PropertyGroupService {
  constructor(@Inject('PRODUCT_COMMAND_SERVICE') private readonly productService: ClientProxy) {}

  async findAll() {
    const message = this.productService.send({ cmd: 'property-group.findAll' }, {});

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(PropertyGroupResultEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const message = this.productService.send({ cmd: 'property-group.findByUuid' }, { uuid });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(PropertyGroupEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(uuid: string, dto: UpdatePropertyGroupDto) {
    if (uuid !== dto.uuid) {
      throw Error('Not persistent');
    }

    const message = this.productService.send({ cmd: 'property-group.update' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(PropertyGroupEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreatePropertyGroupDto) {
    const message = this.productService.send({ cmd: 'property-group.create' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(PropertyGroupEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
