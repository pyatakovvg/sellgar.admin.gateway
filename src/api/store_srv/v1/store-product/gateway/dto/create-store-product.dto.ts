import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { OfferDto } from './offer.dto';

export class CreateStoreProductDto {
  @IsUUID()
  commandId: string;

  @IsUUID()
  shopUuid: string;

  @IsUUID()
  productUuid: string;

  @IsString()
  article: string;

  @IsOptional()
  @IsString()
  titleOverride?: string | null;

  @IsOptional()
  @IsString()
  descriptionOverride?: string | null;

  @IsBoolean()
  showing: boolean;

  @ValidateNested()
  @Type(() => OfferDto)
  offers: OfferDto[];
}
