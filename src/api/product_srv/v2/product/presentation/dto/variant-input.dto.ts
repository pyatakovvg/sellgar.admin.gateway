import { Transform, Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

import { PropertyAssignmentDto } from './property-assignment.dto';
import { VariantImageDto } from './variant-image.dto';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class VariantInputDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name: string;

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
