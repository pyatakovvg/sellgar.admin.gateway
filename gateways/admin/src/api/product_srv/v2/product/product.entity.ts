import { Type, Expose } from 'class-transformer';
import { IsUUID, IsString, ValidateNested, IsNumber, IsDateString, IsOptional } from 'class-validator';

import { BrandEntity } from '../brand/brand.entity';
import { CategoryEntity } from '../category/category.entity';
import { VariantEntity } from '../variant/variant.entity';

export class ProductEntity {
  @IsUUID()
  @Expose()
  uuid: string;

  @IsUUID()
  @Expose()
  brandUuid: string;

  @IsUUID()
  @Expose()
  categoryUuid: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @ValidateNested()
  @Type(() => CategoryEntity)
  category: CategoryEntity;

  @Expose()
  @ValidateNested()
  @Type(() => BrandEntity)
  brand: BrandEntity;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => VariantEntity)
  variants: VariantEntity[];

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

export class ProductResultEntity {
  @Expose()
  @ValidateNested()
  @Type(() => ProductEntity)
  data: ProductEntity[];

  @Expose()
  @ValidateNested()
  @Type(() => MetaEntity)
  meta: MetaEntity;
}
