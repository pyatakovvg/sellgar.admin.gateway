import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsInt, IsString, IsUUID, ValidateNested } from 'class-validator';

import { PropertyEntity } from '../property/property.entity';

export class ProductTypeFieldEntity {
  @Expose()
  @IsString()
  propertyCode: string;

  @Expose()
  @IsBoolean()
  required: boolean;

  @Expose()
  @IsBoolean()
  multiple: boolean;

  @Expose()
  @IsInt()
  sortOrder: number;

  @Expose()
  @ValidateNested()
  @Type(() => PropertyEntity)
  property: PropertyEntity;
}

export class ProductTypeEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsInt()
  version: number;

  @Expose()
  @IsInt()
  activeProductCount: number;

  @Expose()
  @IsInt()
  archivedProductCount: number;

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTypeFieldEntity)
  productFields: ProductTypeFieldEntity[];

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTypeFieldEntity)
  variantFields: ProductTypeFieldEntity[];
}

export class ProductTypePageEntity {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTypeEntity)
  items: ProductTypeEntity[];

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
