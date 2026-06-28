import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { PriceDto } from './price.dto';

export class StoreOfferDto {
  @IsOptional()
  @IsUUID()
  uuid?: string;

  @IsUUID()
  variantUuid: string;

  @IsOptional()
  @IsString()
  article?: string | null;

  @ValidateNested()
  @Type(() => PriceDto)
  currentPrice: PriceDto;

  @IsBoolean()
  showing: boolean;
}
