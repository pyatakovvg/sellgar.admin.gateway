import { Injectable } from '@nestjs/common';

import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { VariantEntity } from '../variant.entity';

import { VariantGateway } from '../gateway/variant.gateway';

import { UpdateProductDto } from '../gateway/dto/update-product.dto';
import { CreateProductDto } from '../gateway/dto/create-product.dto';
import { AddVariantImageDto } from './dto/add-variant-image.dto';

@Injectable()
export class VariantService {
  constructor(private readonly productGateway: VariantGateway) {}

  async findAll() {
    return await this.productGateway.findAll();
  }

  async findByUuid(uuid: string) {
    const result = await this.productGateway.findByUuid(uuid);
    const resultInstance = plainToInstance(VariantEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  update(uuid: string, dto: UpdateProductDto) {
    return this.productGateway.update(uuid, dto);
  }

  create(dto: CreateProductDto) {
    return this.productGateway.create(dto);
  }

  addImage(variantUuid: string, dto: AddVariantImageDto) {
    return this.productGateway.addImage({ ...dto, variantUuid });
  }

  removeImage(variantUuid: string, imageUuid: string) {
    return this.productGateway.removeImage(variantUuid, imageUuid);
  }
}
