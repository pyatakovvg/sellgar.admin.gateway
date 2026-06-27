import { Type, Expose } from 'class-transformer';
import { IsUUID, IsNumber, IsString, ValidateNested, IsDateString } from 'class-validator';

export class ShopEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsString()
  name: string;

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
