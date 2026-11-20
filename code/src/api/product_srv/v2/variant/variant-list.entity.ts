import { Expose, Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator';

import { VariantEntity } from './variant.entity';

export class VariantListEntity {
  @Expose()
  @IsUUID()
  productUuid: string;

  @Expose()
  @IsInt()
  version: number;

  @Expose()
  @IsUUID()
  typeUuid: string;

  @Expose()
  @IsInt()
  typeVersion: number;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantEntity)
  items: VariantEntity[];
}
