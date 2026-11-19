import { Expose, Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { PropertyKind } from './property-kind.enum';
import { PropertyOptionExtraKind } from './property-option-extra-kind.enum';
import { PropertyOptionTextDisplay } from './property-option-text-display.enum';

export class PropertyOptionExtraEntity {
  @Expose()
  @IsEnum(PropertyOptionExtraKind)
  type: PropertyOptionExtraKind;

  @Expose()
  @IsInt()
  sortOrder: number;

  @Expose()
  @IsOptional()
  @IsEnum(PropertyOptionTextDisplay)
  textDisplay: PropertyOptionTextDisplay | null;

  @Expose()
  @IsOptional()
  @IsString()
  valueText: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  valueColor: string | null;

  @Expose()
  @IsOptional()
  @IsUUID()
  imageUuid: string | null;
}

export class PropertyOptionEntity {
  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsInt()
  sortOrder: number;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyOptionExtraEntity)
  extras: PropertyOptionExtraEntity[];
}

export class PropertyEntity {
  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description: string | null;

  @Expose()
  @IsEnum(PropertyKind)
  kind: PropertyKind;

  @Expose()
  @IsOptional()
  @IsString()
  unitCode: string | null;

  @Expose()
  @IsInt()
  version: number;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyOptionEntity)
  options: PropertyOptionEntity[];

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

export class PropertyPageEntity {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyEntity)
  items: PropertyEntity[];

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
