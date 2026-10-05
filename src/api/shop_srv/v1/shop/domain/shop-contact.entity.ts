import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsString, IsUUID, Min } from 'class-validator';

import { ShopContactPurpose } from './shop-contact-purpose.enum';
import { ShopContactType } from './shop-contact-type.enum';

export class ShopContactEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsEnum(ShopContactType)
  type: ShopContactType;

  @Expose()
  @IsEnum(ShopContactPurpose)
  purpose: ShopContactPurpose;

  @Expose()
  @IsString()
  value: string;

  @Expose()
  @IsBoolean()
  isPublic: boolean;

  @Expose()
  @IsInt()
  @Min(0)
  sortOrder: number;
}
