import { Injectable } from '@nestjs/common';

import { UpdateStoreDto } from './dto/update-store.dto';
import { CreateStoreDto } from './dto/create-store.dto';

import { StoreGateway } from '../gateway/store.gateway';

@Injectable()
export class StoreService {
  constructor(private readonly storeGateway: StoreGateway) {}

  async findAll(query: any) {
    return this.storeGateway.findAll(query);
  }

  async findByUuid(uuid: string) {
    return this.storeGateway.findByUuid(uuid);
  }

  async update(dto: UpdateStoreDto) {
    return this.storeGateway.update(dto);
  }

  async create(dto: CreateStoreDto) {
    return this.storeGateway.create(dto);
  }
}
