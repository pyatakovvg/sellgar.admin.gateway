import { Type, Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested, IsNumber, IsDateString, IsBoolean } from 'class-validator';

import { ImageEntity } from '../variant/variant.entity';

export class CategoryImageEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsUUID()
  categoryUuid: string;

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

export class CategoryEntity {
  @IsUUID()
  @Expose()
  uuid: string;

  @Expose()
  @IsNumber()
  version: number;

  @Expose()
  @IsUUID()
  @IsOptional()
  parentUuid?: string;

  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @ValidateNested()
  @Type(() => CategoryImageEntity)
  @IsOptional()
  image?: CategoryImageEntity | null;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryEntity)
  parent?: CategoryEntity;

  @Expose()
  @ValidateNested()
  @Type(() => CategoryEntity)
  children: CategoryEntity[];

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

class MetaEntity {}

export class CategoryResultEntity {
  @Expose()
  @ValidateNested()
  @Type(() => CategoryEntity)
  data: CategoryEntity[];

  meta: MetaEntity;
}
