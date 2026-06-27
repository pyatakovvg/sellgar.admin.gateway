import { Injectable } from '@nestjs/common';

import { UpdateDto } from './dto/update.dto';
import { CreateDto } from './dto/create.dto';

import { ShopGateway } from '../gateway/shop.gateway';

@Injectable()
export class ShopService {
  constructor(private readonly productGateway: ShopGateway) {}

  async findAll() {
    return await this.productGateway.findAll();
  }

  async findByUuid(uuid: string) {
    return await this.productGateway.findByUuid(uuid);
  }

  async update(dto: UpdateDto) {
    return await this.productGateway.update(dto);
  }

  async create(dto: CreateDto) {
    return await this.productGateway.create(dto);
  }
}
