import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

import { firstValueFrom, map } from 'rxjs';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

import { ProductVariantResultEntity } from '../variant.entity';

@Injectable()
export class VariantGateway {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    @Inject('PRODUCT_COMMAND_SERVICE') private readonly productProxy: ClientProxy,
  ) {}

  async findAll() {
    const message = this.productProxy.send({ cmd: 'product.variant.findAll' }, {});
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ProductVariantResultEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const request = this.httpService
      .get(this.config.get('API_PRODUCT_SRV') + '/variants/' + uuid)
      .pipe(map((res) => res.data));

    return firstValueFrom(request);
  }

  async update(uuid: string, dto: UpdateProductDto) {
    const request = this.httpService
      .patch(this.config.get('API_PRODUCT_SRV') + '/variants/' + uuid, dto)
      .pipe(map((res) => res.data));

    return firstValueFrom(request);
  }

  async create(dto: CreateProductDto) {
    const request = this.httpService
      .post(this.config.get('API_PRODUCT_SRV') + '/variants', dto)
      .pipe(map((res) => res.data));

    return firstValueFrom(request);
  }
}
