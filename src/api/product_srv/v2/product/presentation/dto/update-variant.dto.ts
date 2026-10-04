import { Transform, Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateIf, ValidateNested } from 'class-validator';

import { PropertyAssignmentDto } from './property-assignment.dto';
import { VariantImageDto } from './variant-image.dto';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class UpdateVariantDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  version: number;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  typeVersion: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique((assignment: PropertyAssignmentDto) => assignment.propertyCode)
  @ValidateNested({ each: true })
  @Type(() => PropertyAssignmentDto)
  properties?: PropertyAssignmentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantImageDto)
  images?: VariantImageDto[];
}
