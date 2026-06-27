import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { UnitResultEntity, UnitEntity } from '../unit.entity';

import { UpdateUnitDto } from './dto/update-unit.dto';
import { CreateUnitDto } from './dto/create-unit.dto';

@Injectable()
export class UnitService {
  constructor(@Inject('PRODUCT_COMMAND_SERVICE') private readonly productService: ClientProxy) {}

  async findAll() {
    const message = this.productService.send({ cmd: 'unit.findAll' }, {});

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(UnitResultEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const message = this.productService.send({ cmd: 'unit.findByUuid' }, { uuid });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(UnitEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(uuid: string, dto: UpdateUnitDto) {
    if (uuid !== dto.uuid) {
      throw Error('Not persistent');
    }

    const message = this.productService.send({ cmd: 'unit.update' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(UnitEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreateUnitDto) {
    const message = this.productService.send({ cmd: 'unit.create' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(UnitEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
