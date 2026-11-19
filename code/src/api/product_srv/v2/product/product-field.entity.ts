import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';

import { PropertyEntity } from '../property/property.entity';
import { PropertyValueEntity } from './property-value.entity';

export class ProductFieldEntity {
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

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyValueEntity)
  values: PropertyValueEntity[];
}
