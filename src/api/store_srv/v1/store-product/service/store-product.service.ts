import { GetAllStoreProductsCommand } from './command/get-all-store-products.command';
import { InventoryMovementCommand } from './command/inventory-movement.command';
import { AdjustRecordInventoryCommand } from './command/adjust-record-inventory.command';
import { Injectable } from '@nestjs/common';

import { ArchiveStoreProductCommand } from './command/archive-store-product.command';
import { CreateStoreProductCommand } from './command/create-store-product.command';
import { UpdateStoreProductCommand } from './command/update-store-product.command';

import { StoreProductGateway } from '../gateway/store-product.gateway';

@Injectable()
export class StoreProductService {
  constructor(private readonly storeProductGateway: StoreProductGateway) {}

  getAll(query: GetAllStoreProductsCommand) {
    return this.storeProductGateway.getAll(query);
  }

  getByUuid(uuid: string, query: GetAllStoreProductsCommand = {}) {
    return this.storeProductGateway.getByUuid(uuid, query);
  }

  synchronizeCatalog(productUuid: string) {
    return this.storeProductGateway.synchronizeCatalog(productUuid);
  }

  create(dto: CreateStoreProductCommand) {
    return this.storeProductGateway.create(dto);
  }

  update(dto: UpdateStoreProductCommand) {
    return this.storeProductGateway.update(dto);
  }

  archive(dto: ArchiveStoreProductCommand) {
    return this.storeProductGateway.archive(dto);
  }

  receiptInventory(dto: InventoryMovementCommand) {
    return this.storeProductGateway.receiptInventory(dto);
  }

  writeOffInventory(dto: InventoryMovementCommand) {
    return this.storeProductGateway.writeOffInventory(dto);
  }

  adjustInventory(dto: AdjustRecordInventoryCommand) {
    return this.storeProductGateway.adjustInventory(dto);
  }
}
