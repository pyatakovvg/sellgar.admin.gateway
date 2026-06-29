import { Type, Expose } from 'class-transformer';
import { IsUUID, IsString, ValidateNested, IsNumber, IsDateString, IsOptional, IsBoolean } from 'class-validator';

import { ImageEntity } from '../variant/variant.entity';

export class BrandImageEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsUUID()
  brandUuid: string;

  @Expose()
  @IsUUID()
  imageUuid: string;

  @Expose()
  @IsNumber()
  sortOrder: number;

  @Expose()
  @IsBoolean()
  isPrimary: boolean;

  @Expose()
  @IsString()
  @IsOptional()
  alt?: string | null;

  @Expose()
  @ValidateNested()
  @Type(() => ImageEntity)
  image: ImageEntity;
}

export class BrandEntity {
  @IsUUID()
  @Expose()
  uuid: string;

  @Expose()
  @IsNumber()
  version: number;

  @IsString()
  @Expose()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @ValidateNested()
  @Type(() => BrandImageEntity)
  @IsOptional()
  image?: BrandImageEntity | null;

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

export class BrandResultEntity {
  @Expose()
  @ValidateNested()
  @Type(() => BrandEntity)
  data: BrandEntity[];

  @Expose()
  @ValidateNested()
  @Type(() => MetaEntity)
  meta: MetaEntity;
}
