import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

import { ShopContactPurpose } from '../../domain/shop-contact-purpose.enum';
import { ShopContactType } from '../../domain/shop-contact-type.enum';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class ShopContactDto {
  @IsEnum(ShopContactType)
  type: ShopContactType;

  @IsEnum(ShopContactPurpose)
  purpose: ShopContactPurpose;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  value: string;

  @IsBoolean()
  isPublic: boolean;

  @IsInt()
  @Min(0)
  @Max(2147483647)
  sortOrder: number;
}
