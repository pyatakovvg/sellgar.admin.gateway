import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateIf, ValidateNested } from 'class-validator';

import { PropertyOptionExtraDto } from './property-option-extra.dto';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class UpdatePropertyOptionDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  version: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyOptionExtraDto)
  extras?: PropertyOptionExtraDto[];
}
