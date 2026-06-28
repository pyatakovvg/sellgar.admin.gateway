import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

import { ArchiveStoreProductDto } from './dto/archive-store-product.dto';
import { AdjustOfferInventoryDto } from './dto/adjust-offer-inventory.dto';
import { CreateStoreProductDto } from './dto/create-store-product.dto';
import { ReceiptOfferInventoryDto } from './dto/receipt-offer-inventory.dto';
import { UpdateStoreProductDto } from './dto/update-store-product.dto';
import { WriteOffOfferInventoryDto } from './dto/write-off-offer-inventory.dto';

import { OfferInventoryEntity, StoreProductEntity, StoreProductResultEntity } from '../store-product.entity';

@Injectable()
export class StoreProductGateway {
  constructor(@Inject('STORE_COMMAND_SERVICE') private readonly storeProxy: ClientProxy) {}

  async findAll(query: any) {
    const message = this.storeProxy.send({ cmd: 'store.product.getAll' }, { query });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreProductResultEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const message = this.storeProxy.send({ cmd: 'store.product.getByUuid' }, { uuid });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreateStoreProductDto) {
    const message = this.storeProxy.send({ cmd: 'store.product.create' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(dto: UpdateStoreProductDto) {
    const message = this.storeProxy.send({ cmd: 'store.product.update' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async archive(dto: ArchiveStoreProductDto) {
    const message = this.storeProxy.send({ cmd: 'store.product.archive' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(StoreProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async receiptInventory(dto: ReceiptOfferInventoryDto) {
    const message = this.storeProxy.send({ cmd: 'store.inventory.receipt' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(OfferInventoryEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async writeOffInventory(dto: WriteOffOfferInventoryDto) {
    const message = this.storeProxy.send({ cmd: 'store.inventory.writeOff' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(OfferInventoryEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async adjustInventory(dto: AdjustOfferInventoryDto) {
    const message = this.storeProxy.send({ cmd: 'store.inventory.adjust' }, dto);

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(OfferInventoryEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
