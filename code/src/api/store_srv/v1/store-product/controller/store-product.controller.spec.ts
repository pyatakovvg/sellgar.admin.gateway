import { describe, it, expect, jest } from '@jest/globals';
import { ValidationPipe } from '@nestjs/common';
import { StoreProductController } from './store-product.controller';
import { StoreProductService } from '../service/store-product.service';
import { UpdateStoreProductDto } from './dto/update-store-product.dto';
import { ReceiptRecordInventoryDto } from './dto/receipt-record-inventory.dto';
import { CreateStoreProductDto } from './dto/create-store-product.dto';

const uuid = '3012a751-2bbc-4300-a8f3-8dc744f7daf7';
const other = '1b50b30d-e953-49d4-8f6f-c9a27ff447ae';
const pipe = new ValidationPipe({ transform: true, whitelist: true });

describe(StoreProductController.name, () => {
  it('takes the product identity from the URL without requiring it in the body', async () => {
    const service = { update: jest.fn<StoreProductService['update']>() };
    const controller = new StoreProductController(service as unknown as StoreProductService);
    const body = await pipe.transform(
      { commandId: other, expectedVersion: 1, showing: true },
      { type: 'body', metatype: UpdateStoreProductDto },
    );
    await controller.update(uuid, body);
    expect(service.update).toHaveBeenCalledWith(expect.objectContaining({ uuid, expectedVersion: 1 }));
  });
  it('addresses the inventory by the selected accounting record, using the URL identity', async () => {
    const service = { receiptInventory: jest.fn<StoreProductService['receiptInventory']>() };
    const controller = new StoreProductController(service as unknown as StoreProductService);
    const body = await pipe.transform(
      { commandId: other, expectedVersion: 1, quantity: 4, recordUuid: other },
      { type: 'body', metatype: ReceiptRecordInventoryDto },
    );
    await controller.receipt(uuid, body);
    expect(service.receiptInventory).toHaveBeenCalledWith(expect.objectContaining({ recordUuid: uuid, quantity: 4 }));
  });
  it('rejects an explicitly empty record collection instead of creating an association without stock', async () => {
    const body = {
      commandId: uuid,
      shopUuid: other,
      productUuid: other,
      showing: true,
      offers: [
        { variantUuid: other, showing: true, currentPrice: { value: '1500.00', currencyCode: 'RUB' }, records: [] },
      ],
    };
    await expect(pipe.transform(body, { type: 'body', metatype: CreateStoreProductDto })).rejects.toThrow();
  });
});
