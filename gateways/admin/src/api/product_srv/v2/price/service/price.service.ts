import { Injectable } from '@nestjs/common';

import { PriceGateway } from '../gateway/price.gateway';

import { CreatePriceDto } from '../gateway/dto/create-price.dto';

@Injectable()
export class PriceService {
  constructor(private readonly productGateway: PriceGateway) {}

  findAll(productUuid: string) {
    return this.productGateway.findAll(productUuid);
  }

  create(productUuid: string, dto: CreatePriceDto) {
    return this.productGateway.create(productUuid, dto);
  }
}
