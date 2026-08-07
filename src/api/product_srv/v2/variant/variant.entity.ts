import { Type, Expose } from 'class-transformer';
import { IsUUID, IsString, IsOptional, ValidateNested, IsNumber, IsDateString, IsEnum } from 'class-validator';

import { CatalogStatus } from '../catalog-status.enum';
import { ProductEntity } from '../product/product.entity';
import { PropertyEntity } from '../property/property.entity';

export class ImageEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsString()
  fileName: string;
}

export class VariantPropertyEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsUUID()
  propertyUuid: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  optionUuid: string | null;

  @Expose()
  @ValidateNested()
  @Type(() => PropertyEntity)
  property: PropertyEntity;

  @Expose()
  @IsString()
  value: string;

  @Expose()
  @IsNumber()
  order: number;
}

export class VariantImageEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsUUID()
  imageUuid: string;

  @Expose()
  @ValidateNested()
  @Type(() => ImageEntity)
  image: ImageEntity;

  @Expose()
  @IsNumber()
  order: number;

  @Expose()
  @IsString()
  @IsOptional()
  alt?: string | null;
}

export class VariantEntity {
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
  @IsString()
  description: string;

  @Expose()
  @IsEnum(CatalogStatus)
  status: CatalogStatus;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductEntity)
  product: ProductEntity;

  @Expose()
  @ValidateNested()
  @Type(() => VariantPropertyEntity)
  properties: VariantPropertyEntity[];

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => VariantImageEntity)
  images: VariantImageEntity[];

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

export class ProductVariantResultEntity {
  @Expose()
  @ValidateNested()
  @Type(() => VariantEntity)
  data: VariantEntity[];

  @Expose()
  @ValidateNested()
  @Type(() => MetaEntity)
  meta: MetaEntity;
}
