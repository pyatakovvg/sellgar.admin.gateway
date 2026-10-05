import { Injectable } from '@nestjs/common';

import { ShopServiceClient } from '../../shared/shop-service.client';
import { ShopServiceCommand } from '../../shared/shop-service.constants';
import { ShopEntity } from '../domain/shop.entity';
import { ShopPageEntity } from '../domain/shop-page.entity';
import { CreateShopDto } from '../presentation/dto/create-shop.dto';
import { GetAllShopsDto } from '../presentation/dto/get-all-shops.dto';
import { UpdateShopDto } from '../presentation/dto/update-shop.dto';

@Injectable()
export class ShopService {
  constructor(private readonly client: ShopServiceClient) {}

  getAll(query: GetAllShopsDto) {
    return this.client.request(ShopServiceCommand.getAll, query, ShopPageEntity);
  }

  getByUuid(uuid: string) {
    return this.client.request(ShopServiceCommand.getByUuid, { uuid }, ShopEntity);
  }

  create(dto: CreateShopDto) {
    return this.client.request(ShopServiceCommand.create, dto, ShopEntity);
  }

  update(uuid: string, dto: UpdateShopDto) {
    return this.client.request(ShopServiceCommand.update, { uuid, ...dto }, ShopEntity);
  }

}
