import { Expose, Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { ProductFieldEntity } from '../product/product-field.entity';
import { ProductStatus } from '../product/product-status.enum';

export class VariantImageEntity {
  @Expose()
  @IsUUID()
  imageUuid: string;

  @Expose()
  @IsString()
  fileName: string;

  @Expose()
  @IsInt()
  sortOrder: number;
}

export class VariantEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description: string | null;

  @Expose()
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFieldEntity)
  properties: ProductFieldEntity[];

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantImageEntity)
  images: VariantImageEntity[];

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}
