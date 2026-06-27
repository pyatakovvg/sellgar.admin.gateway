import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

import { CategoryResultEntity, CategoryEntity } from '../category.entity';

@Injectable()
export class CategoryService {
  constructor(@Inject('PRODUCT_COMMAND_SERVICE') private readonly productService: ClientProxy) {}

  async findAll() {
    const message = this.productService.send({ cmd: 'category.findAll' }, {});

    const result = await firstValueFrom(message);

    console.log(result);
    const resultInstance = plainToInstance(CategoryResultEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const message = this.productService.send({ cmd: 'category.findByUuid' }, { uuid });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CategoryEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(uuid: string, dto: UpdateCategoryDto) {
    if (uuid !== dto.uuid) {
      throw Error('Not persistent');
    }

    const message = this.productService.send({ cmd: 'category.update' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CategoryEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreateCategoryDto) {
    const message = this.productService.send({ cmd: 'category.create' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CategoryEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
