import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsDefined,
  IsString,
  IsUUID,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { CartItemEntity } from './cart-item.entity';

export class CartMetadataEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsUUID()
  ownerUuid: string;

  @Expose()
  @IsString()
  @Matches(/^(0|[1-9]\d*)$/)
  version: string;

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsDateString()
  closedAt: string | null;
}

export class CartShopEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  name: string | null;
}

export class CartEntity extends CartMetadataEntity {
  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => CartShopEntity)
  shop: CartShopEntity;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemEntity)
  items: CartItemEntity[];

  @Expose()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currencyCode: string;

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Matches(/^\d+\.\d{2}$/)
  itemsTotal: string | null;
}
