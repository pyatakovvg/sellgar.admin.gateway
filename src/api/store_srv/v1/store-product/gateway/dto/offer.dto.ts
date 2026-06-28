import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { PriceDto } from './price.dto';

export class OfferDto {
  @IsOptional()
  @IsUUID()
  uuid?: string;

  @IsUUID()
  variantUuid: string;

  @IsOptional()
  @IsString()
  sku?: string | null;

  @IsOptional()
  @IsString()
  article?: string | null;

  @IsOptional()
  @IsString()
  titleOverride?: string | null;

  @IsOptional()
  @IsString()
  descriptionOverride?: string | null;

  @ValidateNested()
  @Type(() => PriceDto)
  currentPrice: PriceDto;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  reserved?: number;

  @IsBoolean()
  showing: boolean;
}
