import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

import { GetAllStoreProductsCommand } from '../service/command/get-all-store-products.command';
import { ArchiveStoreProductCommand } from '../service/command/archive-store-product.command';
import { AdjustRecordInventoryCommand } from '../service/command/adjust-record-inventory.command';
import { InventoryMovementCommand } from '../service/command/inventory-movement.command';
import { CreateStoreProductCommand } from '../service/command/create-store-product.command';
import { UpdateStoreProductCommand } from '../service/command/update-store-product.command';

import { RecordInventoryEntity, StoreProductEntity, StoreProductResultEntity } from '../entity';

@Injectable()
export class StoreProductGateway {
  constructor(@Inject('STORE_COMMAND_SERVICE') private readonly storeProxy: ClientProxy) {}

  async getAll(query: GetAllStoreProductsCommand) {
    const message = this.storeProxy.send({ cmd: 'store.product.getAll' }, { query });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreProductResultEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async getByUuid(uuid: string, query: GetAllStoreProductsCommand = {}) {
    const message = this.storeProxy.send({ cmd: 'store.product.getByUuid' }, { uuid, query });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  synchronizeCatalog(productUuid: string) {
    return firstValueFrom(this.storeProxy.send({ cmd: 'store.catalog.synchronize' }, { productUuid }));
  }

  async create(dto: CreateStoreProductCommand) {
    const message = this.storeProxy.send({ cmd: 'store.product.create' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(dto: UpdateStoreProductCommand) {
    const message = this.storeProxy.send({ cmd: 'store.product.update' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async archive(dto: ArchiveStoreProductCommand) {
    const message = this.storeProxy.send({ cmd: 'store.product.archive' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async receiptInventory(dto: InventoryMovementCommand) {
    const message = this.storeProxy.send({ cmd: 'store.inventory.receipt' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(RecordInventoryEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async writeOffInventory(dto: InventoryMovementCommand) {
    const message = this.storeProxy.send({ cmd: 'store.inventory.writeOff' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(RecordInventoryEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async adjustInventory(dto: AdjustRecordInventoryCommand) {
    const message = this.storeProxy.send({ cmd: 'store.inventory.adjust' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(RecordInventoryEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
