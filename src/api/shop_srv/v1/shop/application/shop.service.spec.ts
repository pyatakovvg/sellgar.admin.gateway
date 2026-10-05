import 'reflect-metadata';

import { ShopServiceClient } from '../../shared/shop-service.client';
import { ShopServiceCommand } from '../../shared/shop-service.constants';
import { ShopEntity } from '../domain/shop.entity';
import { ShopPageEntity } from '../domain/shop-page.entity';
import { ShopService } from './shop.service';

describe('ShopService', () => {
  const createSubject = () => {
    const client = { request: jest.fn() } as unknown as ShopServiceClient;
    return { client, service: new ShopService(client) };
  };

  it('передаёт серверные фильтры в getAll', async () => {
    const { client, service } = createSubject();
    const query = { limit: 25, offset: 50 };

    await service.getAll(query);

    expect(client.request).toHaveBeenCalledWith(ShopServiceCommand.getAll, query, ShopPageEntity);
  });

  it('добавляет uuid маршрута в versioned update', async () => {
    const { client, service } = createSubject();
    const uuid = 'c7fd8d23-c843-4d47-8d23-33698a5f034f';
    const dto = { version: 4, name: 'Магазин' };

    await service.update(uuid, dto);

    expect(client.request).toHaveBeenCalledWith(ShopServiceCommand.update, { uuid, ...dto }, ShopEntity);
  });

});
