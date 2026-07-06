import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class PropertyOptionMetadataDto {
  @IsUUID()
  @IsOptional()
  uuid?: string;

  @IsIn(['TEXT', 'COLOR', 'IMAGE', 'ICON'])
  valueType: 'TEXT' | 'COLOR' | 'IMAGE' | 'ICON';

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsString()
  @IsOptional()
  textValue?: string | null;

  @IsString()
  @IsOptional()
  colorValue?: string | null;

  @IsUUID()
  @IsOptional()
  fileUuid?: string | null;

  @IsString()
  @IsOptional()
  iconCode?: string | null;
}

export class PropertyOptionDto {
  @IsUUID()
  @IsOptional()
  uuid?: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ValidateNested({ each: true })
  @Type(() => PropertyOptionMetadataDto)
  @IsArray()
  @IsOptional()
  metadata?: PropertyOptionMetadataDto[];
}

export class CreatePropertyDto {
  @IsUUID()
  @IsOptional()
  unitUuid?: string | null;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsIn(['TEXT', 'NUMBER', 'BOOLEAN', 'OPTION', 'DATE'])
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'OPTION' | 'DATE';

  @ValidateNested({ each: true })
  @Type(() => PropertyOptionDto)
  @IsArray()
  @IsOptional()
  options?: PropertyOptionDto[];

}
