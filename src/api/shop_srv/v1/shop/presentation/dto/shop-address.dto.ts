import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { ShopAddressType } from '../../domain/shop-address-type.enum';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class ShopAddressDto {
  @IsEnum(ShopAddressType)
  type: ShopAddressType;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  address: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2048)
  comment?: string | null;
}
