import { Body, Controller, Get, Param, Patch, Post, Query, ParseUUIDPipe } from '@nestjs/common';
import { CreateStoreProductDto } from './dto/create-store-product.dto';
import { UpdateStoreProductDto } from './dto/update-store-product.dto';
import { ArchiveStoreProductDto } from './dto/archive-store-product.dto';
import { ReceiptRecordInventoryDto } from './dto/receipt-record-inventory.dto';
import { WriteOffRecordInventoryDto } from './dto/write-off-record-inventory.dto';
import { AdjustRecordInventoryDto } from './dto/adjust-record-inventory.dto';
import { GetAllStoreProductsDto } from './dto/get-all-store-products.dto';
import { StoreProductService } from '../service/store-product.service';

@Controller('v2/store/products')
export class StoreProductController {
  constructor(private readonly service: StoreProductService) {}
  @Get() getAll(
    @Query()
    query: GetAllStoreProductsDto,
  ) {
    return this.service.getAll(query);
  }
  @Get(':uuid') getByUuid(
    @Param('uuid', new ParseUUIDPipe())
    uuid: string,
  ) {
    return this.service.getByUuid(uuid);
  }
  @Post() create(
    @Body()
    dto: CreateStoreProductDto,
  ) {
    return this.service.create(dto);
  }
  @Patch(':uuid') update(
    @Param('uuid', new ParseUUIDPipe())
    uuid: string,
    @Body()
    dto: UpdateStoreProductDto,
  ) {
    return this.service.update({ ...dto, uuid });
  }
  @Patch(':uuid/archive') archive(
    @Param('uuid', new ParseUUIDPipe())
    uuid: string,
    @Body()
    dto: ArchiveStoreProductDto,
  ) {
    return this.service.archive({ ...dto, uuid });
  }
  @Post('catalog/:productUuid/synchronize') synchronizeCatalog(
    @Param('productUuid', new ParseUUIDPipe())
    uuid: string,
  ) {
    return this.service.synchronizeCatalog(uuid);
  }
  @Post('records/:recordUuid/inventory/receipt') receipt(
    @Param('recordUuid', new ParseUUIDPipe())
    recordUuid: string,
    @Body()
    dto: ReceiptRecordInventoryDto,
  ) {
    return this.service.receiptInventory({ ...dto, recordUuid });
  }
  @Post('records/:recordUuid/inventory/write-off') writeOff(
    @Param('recordUuid', new ParseUUIDPipe())
    recordUuid: string,
    @Body()
    dto: WriteOffRecordInventoryDto,
  ) {
    return this.service.writeOffInventory({ ...dto, recordUuid });
  }
  @Post('records/:recordUuid/inventory/adjust') adjust(
    @Param('recordUuid', new ParseUUIDPipe())
    recordUuid: string,
    @Body()
    dto: AdjustRecordInventoryDto,
  ) {
    return this.service.adjustInventory({ ...dto, recordUuid });
  }
}
