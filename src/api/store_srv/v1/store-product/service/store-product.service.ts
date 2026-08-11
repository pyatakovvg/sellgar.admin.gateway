import { Injectable } from '@nestjs/common';

import { ArchiveStoreProductDto } from './dto/archive-store-product.dto';
import { AdjustOfferInventoryDto } from '../gateway/dto/adjust-offer-inventory.dto';
import { CreateStoreProductDto } from './dto/create-store-product.dto';
import { UpdateStoreProductDto } from './dto/update-store-product.dto';
import { ReceiptOfferInventoryDto } from '../gateway/dto/receipt-offer-inventory.dto';
import { WriteOffOfferInventoryDto } from '../gateway/dto/write-off-offer-inventory.dto';

import { StoreProductGateway } from '../gateway/store-product.gateway';
import { StoreProductViewComposer } from '../composer/store-product-view.composer';

@Injectable()
export class StoreProductService {
  constructor(
    private readonly storeProductGateway: StoreProductGateway,
    private readonly composer: StoreProductViewComposer,
  ) {}

  async findAll(query: any) {
    const result = await this.storeProductGateway.findAll(query);

    return this.composer.composeResult(result);
  }

  async findByUuid(uuid: string) {
    const result = await this.storeProductGateway.findByUuid(uuid);

    return this.composer.compose(result);
  }

  async create(dto: CreateStoreProductDto) {
    const result = await this.storeProductGateway.create(dto);

    return this.composer.compose(result);
  }

  async update(dto: UpdateStoreProductDto) {
    const result = await this.storeProductGateway.update(dto);

    return this.composer.compose(result);
  }

  async archive(dto: ArchiveStoreProductDto) {
    const result = await this.storeProductGateway.archive(dto);

    return this.composer.compose(result);
  }

  async receiptInventory(dto: ReceiptOfferInventoryDto) {
    const result = await this.storeProductGateway.receiptInventory(dto);

    return this.composer.composeInventory(result);
  }

  async writeOffInventory(dto: WriteOffOfferInventoryDto) {
    const result = await this.storeProductGateway.writeOffInventory(dto);

    return this.composer.composeInventory(result);
  }

  async adjustInventory(dto: AdjustOfferInventoryDto) {
    const result = await this.storeProductGateway.adjustInventory(dto);

    return this.composer.composeInventory(result);
  }
}
