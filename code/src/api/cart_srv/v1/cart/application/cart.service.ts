import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { CartServiceClient } from '../../shared/cart-service.client';
import { CartServiceCommand } from '../../shared/cart-service.constants';
import { CartEntity } from '../domain/cart.entity';
import { CartPageEntity } from '../domain/cart-page.entity';
import { GetAllCartsDto } from '../presentation/dto/get-all-carts.dto';
import { AddCartItemDto, RemoveCartItemDto, SetCartItemDto } from '../presentation/dto/cart-item.dto';
import { CartItemMutationEntity } from '../domain/cart-item-mutation.entity';

@Injectable()
export class CartService {
  constructor(private readonly client: CartServiceClient) {}

  getAll(query: GetAllCartsDto) {
    return this.client.request(CartServiceCommand.getAll, query, CartPageEntity);
  }

  getByUuid(uuid: string) {
    return this.client.request(CartServiceCommand.getByUuid, { uuid }, CartEntity);
  }

  add(cartUuid: string, input: AddCartItemDto) {
    return this.client.request(
      CartServiceCommand.add,
      { ...input, cartUuid, idempotencyKey: randomUUID() },
      CartItemMutationEntity,
    );
  }

  setQuantity(cartUuid: string, recordUuid: string, input: SetCartItemDto) {
    const { version, ...changes } = input;
    return this.client.request(
      CartServiceCommand.setQuantity,
      { ...changes, expectedItemVersion: version, cartUuid, recordUuid, idempotencyKey: randomUUID() },
      CartItemMutationEntity,
    );
  }

  remove(cartUuid: string, recordUuid: string, input: RemoveCartItemDto) {
    const { version, ...changes } = input;
    return this.client.request(
      CartServiceCommand.remove,
      { ...changes, expectedItemVersion: version, cartUuid, recordUuid, idempotencyKey: randomUUID() },
      CartItemMutationEntity,
    );
  }
}
