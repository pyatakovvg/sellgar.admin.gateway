import { Expose, Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { VariantEntity } from '../variant/variant.entity';
import { ProductFieldEntity } from './product-field.entity';
import { ProductStatus } from './product-status.enum';

export class ProductEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsUUID()
  typeUuid: string;

  @Expose()
  @IsInt()
  typeVersion: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description: string | null;

  @Expose()
  @IsString()
  brandCode: string;

  @Expose()
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @Expose()
  @IsInt()
  version: number;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFieldEntity)
  properties: ProductFieldEntity[];

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantEntity)
  variants: VariantEntity[];

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

export class ProductPageEntity {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductEntity)
  items: ProductEntity[];

  @Expose()
  @IsInt()
  total: number;

  @Expose()
  @IsInt()
  limit: number;

  @Expose()
  @IsInt()
  offset: number;
}
