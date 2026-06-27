import { Type, Expose } from 'class-transformer';
import { IsUUID, IsBoolean, ValidateNested, IsNumber, IsDateString } from 'class-validator';

import { ShopEntity } from '@/api/shop_srv/v1/shop/shop.entity';
import { PriceEntity } from '../price/price.entity';
import { VariantEntity } from '../variant/variant.entity';

export class StoreEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsUUID()
  shopUuid: string;

  @Expose()
  @ValidateNested()
  @Type(() => ShopEntity)
  shop: ShopEntity;

  @Expose()
  @IsUUID()
  variantUuid: string;

  @Expose()
  @ValidateNested()
  @Type(() => VariantEntity)
  variant: VariantEntity;

  @Expose()
  @IsNumber()
  count: number;

  @Expose()
  @ValidateNested()
  @Type(() => PriceEntity)
  prices: PriceEntity[];

  @Expose()
  @ValidateNested()
  @Type(() => PriceEntity)
  currentPrice: PriceEntity;

  @Expose()
  @IsBoolean()
  showing: boolean;

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

export class StoreResultEntity {
  @Expose()
  @ValidateNested()
  @Type(() => StoreEntity)
  data: StoreEntity[];

  @Expose()
  @ValidateNested()
  @Type(() => MetaEntity)
  meta: MetaEntity;
}
