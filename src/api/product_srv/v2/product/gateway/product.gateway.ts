import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { ProductEntity, ProductResultEntity } from '../product.entity';

@Injectable()
export class ProductGateway {
  constructor(@Inject('PRODUCT_COMMAND_SERVICE') private readonly productProxy: ClientProxy) {}

  async findAll() {
    const message = this.productProxy.send({ cmd: 'product.getAll' }, {});

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ProductResultEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const message = this.productProxy.send({ cmd: 'product.getByUuid' }, { uuid });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreateProductDto) {
    const message = this.productProxy.send({ cmd: 'product.create' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(dto: UpdateProductDto) {
    const message = this.productProxy.send({ cmd: 'product.update' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
