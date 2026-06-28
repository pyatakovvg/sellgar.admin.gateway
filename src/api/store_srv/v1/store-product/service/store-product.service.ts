import { Injectable } from '@nestjs/common';

import { ArchiveStoreProductDto } from './dto/archive-store-product.dto';
import { AdjustOfferInventoryDto } from '../gateway/dto/adjust-offer-inventory.dto';
import { CreateStoreProductDto } from './dto/create-store-product.dto';
import { UpdateStoreProductDto } from './dto/update-store-product.dto';
import { ReceiptOfferInventoryDto } from '../gateway/dto/receipt-offer-inventory.dto';
import { WriteOffOfferInventoryDto } from '../gateway/dto/write-off-offer-inventory.dto';

import { StoreProductGateway } from '../gateway/store-product.gateway';

@Injectable()
export class StoreProductService {
  constructor(private readonly storeProductGateway: StoreProductGateway) {}

  findAll(query: any) {
    return this.storeProductGateway.findAll(query);
  }

  findByUuid(uuid: string) {
    return this.storeProductGateway.findByUuid(uuid);
  }

  create(dto: CreateStoreProductDto) {
    return this.storeProductGateway.create(dto);
  }

  update(dto: UpdateStoreProductDto) {
    return this.storeProductGateway.update(dto);
  }

  archive(dto: ArchiveStoreProductDto) {
    return this.storeProductGateway.archive(dto);
  }

  receiptInventory(dto: ReceiptOfferInventoryDto) {
    return this.storeProductGateway.receiptInventory(dto);
  }

  writeOffInventory(dto: WriteOffOfferInventoryDto) {
    return this.storeProductGateway.writeOffInventory(dto);
  }

  adjustInventory(dto: AdjustOfferInventoryDto) {
    return this.storeProductGateway.adjustInventory(dto);
  }
}
