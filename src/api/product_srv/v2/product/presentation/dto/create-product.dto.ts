import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';

import { PropertyAssignmentDto } from './property-assignment.dto';
import { VariantInputDto } from './variant-input.dto';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CreateProductDto {
  @IsUUID()
  typeUuid: string;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  typeVersion: number;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  brandCode: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique((assignment: PropertyAssignmentDto) => assignment.propertyCode)
  @ValidateNested({ each: true })
  @Type(() => PropertyAssignmentDto)
  properties?: PropertyAssignmentDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariantInputDto)
  variants: VariantInputDto[];
}
