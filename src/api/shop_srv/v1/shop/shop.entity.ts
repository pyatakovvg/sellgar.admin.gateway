import { Type, Expose } from 'class-transformer';
import { IsUUID, IsNumber, IsString, ValidateNested, IsDateString, IsEnum } from 'class-validator';

import { ShopStatus } from './shop-status.enum';

export class ShopEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsNumber()
  version: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsEnum(ShopStatus)
  status: ShopStatus;

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

class MetaEntity {
  @Expose()
  @IsNumber()
  totalRows: number;
}

export class ShopResultEntity {
  @Expose()
  @ValidateNested()
  @Type(() => ShopEntity)
  data: ShopEntity[];

  @Expose()
  @ValidateNested()
  @Type(() => MetaEntity)
  meta: MetaEntity;
}
