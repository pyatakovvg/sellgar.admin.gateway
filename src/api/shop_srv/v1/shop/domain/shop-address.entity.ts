import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { ShopAddressType } from './shop-address-type.enum';

export class ShopAddressEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsEnum(ShopAddressType)
  type: ShopAddressType;

  @Expose()
  @IsString()
  address: string;

  @Expose()
  @IsOptional()
  @IsString()
  comment: string | null;
}
