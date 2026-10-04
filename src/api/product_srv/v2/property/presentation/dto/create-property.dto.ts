import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, MaxLength, MinLength, ValidateIf, ValidateNested } from 'class-validator';

import { PropertyKind } from '../../property-kind.enum';
import { PropertyOptionDto } from './property-option.dto';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CreatePropertyDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  code: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsEnum(PropertyKind)
  kind: PropertyKind;

  @ValidateIf((_object, value: unknown) => value !== undefined && value !== null)
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  unitCode?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyOptionDto)
  options?: PropertyOptionDto[];
}
