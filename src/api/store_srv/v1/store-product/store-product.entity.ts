import { Type, Expose } from 'class-transformer';
import { IsUUID, IsDateString, ValidateNested, IsNumber, IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';

import { StoreProductStatus } from './store-product-status.enum';

export class CurrencyEntity {
  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  value: string;

  @Expose()
  @IsNumber()
  order: number;

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

export class ShopSnapshotEntity {
  @Expose()
  @IsUUID()
  shopUuid: string;

  @Expose()
  @IsNumber()
  sourceVersion: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  status: string;

  @Expose()
  @IsDateString()
  syncedAt: string;
}

export class ProductSnapshotEntity {
  @Expose()
  @IsUUID()
  productUuid: string;

  @Expose()
  @IsNumber()
  sourceVersion: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  status: string;

  @Expose()
  @IsDateString()
  syncedAt: string;
}

export class VariantSnapshotEntity {
  @Expose()
  @IsUUID()
  variantUuid: string;

  @Expose()
  @IsUUID()
  productUuid: string;

  @Expose()
  @IsNumber()
  sourceVersion: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  status: string;

  @Expose()
  @IsDateString()
  syncedAt: string;
}

export class PriceHistoryEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsUUID()
  offerUuid: string;

  @Expose()
  @IsNumber()
  value: number;

  @Expose()
  @IsString()
  currencyCode: string;

  @Expose()
  @ValidateNested()
  @Type(() => CurrencyEntity)
  currency: CurrencyEntity;

  @Expose()
  @IsDateString()
  startsAt: string;

  @Expose()
  @IsOptional()
  @IsDateString()
  endsAt?: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  reason?: string | null;

  @Expose()
  @IsDateString()
  createdAt: string;
}

export class InventoryEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsUUID()
  offerUuid: string;

  @Expose()
  @IsNumber()
  quantity: number;

  @Expose()
  @IsNumber()
  reserved: number;

  @Expose()
  @IsNumber()
  version: number;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

export class StoreVariantOfferEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsNumber()
  version: number;

  @Expose()
  @IsUUID()
  storeProductUuid: string;

  @Expose()
  @IsUUID()
  variantUuid: string;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => VariantSnapshotEntity)
  variantSnapshot?: VariantSnapshotEntity | null;

  @Expose()
  @IsOptional()
  @IsString()
  sku?: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  article?: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  titleOverride?: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  descriptionOverride?: string | null;

  @Expose()
  @IsEnum(StoreProductStatus)
  status: StoreProductStatus;

  @Expose()
  @IsBoolean()
  showing: boolean;

  @Expose()
  @ValidateNested()
  @Type(() => PriceHistoryEntity)
  prices: PriceHistoryEntity[];

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceHistoryEntity)
  currentPrice?: PriceHistoryEntity | null;

  @Expose()
  @ValidateNested()
  @Type(() => InventoryEntity)
  inventory: InventoryEntity[];

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => InventoryEntity)
  currentInventory?: InventoryEntity | null;

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

export class StoreProductEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsNumber()
  version: number;

  @Expose()
  @IsUUID()
  shopUuid: string;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => ShopSnapshotEntity)
  shopSnapshot?: ShopSnapshotEntity | null;

  @Expose()
  @IsUUID()
  productUuid: string;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductSnapshotEntity)
  productSnapshot?: ProductSnapshotEntity | null;

  @Expose()
  @IsString()
  article: string;

  @Expose()
  @IsOptional()
  @IsString()
  titleOverride?: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  descriptionOverride?: string | null;

  @Expose()
  @IsEnum(StoreProductStatus)
  status: StoreProductStatus;

  @Expose()
  @IsBoolean()
  showing: boolean;

  @Expose()
  @ValidateNested()
  @Type(() => StoreVariantOfferEntity)
  offers: StoreVariantOfferEntity[];

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

class MetaEntity {
  @Expose()
  @IsNumber()
  totalRows: number;
}

export class StoreProductResultEntity {
  @Expose()
  @ValidateNested()
  @Type(() => StoreProductEntity)
  data: StoreProductEntity[];

  @Expose()
  @ValidateNested()
  @Type(() => MetaEntity)
  meta: MetaEntity;
}
