import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ShopAddressDto } from './shop-address.dto';
import { ShopContactDto } from './shop-contact.dto';
import { ShopLegalDetailsDto } from './shop-legal-details.dto';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class UpdateShopDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  version: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShopLegalDetailsDto)
  legalDetails?: ShopLegalDetailsDto | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShopContactDto)
  contacts?: ShopContactDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShopAddressDto)
  addresses?: ShopAddressDto[];

}
