import { Transform, Type } from 'class-transformer';
import { IsArray, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

import { PropertyValueDto } from './property-value.dto';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class PropertyAssignmentDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  propertyCode: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyValueDto)
  values: PropertyValueDto[];
}
