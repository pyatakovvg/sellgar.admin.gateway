import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateBrandDto } from './dto/create-brand.dto';

import { BrandResultEntity, BrandEntity } from '../brand.entity';

@Injectable()
export class BrandService {
  constructor(@Inject('PRODUCT_COMMAND_SERVICE') private readonly productService: ClientProxy) {}

  async findAll() {
    const message = this.productService.send({ cmd: 'brand.findAll' }, {});
    const result = await firstValueFrom(message);

    const resultInstance = plainToInstance(BrandResultEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const message = this.productService.send({ cmd: 'brand.findByUuid' }, { uuid });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(BrandEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(uuid: string, dto: UpdateBrandDto) {
    if (uuid !== dto.uuid) {
      throw Error('Not persistent');
    }

    const message = this.productService.send({ cmd: 'brand.update' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(BrandEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreateBrandDto) {
    const message = this.productService.send({ cmd: 'brand.create' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(BrandEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
