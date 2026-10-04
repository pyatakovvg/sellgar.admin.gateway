import { Type } from 'class-transformer';
import { IsInt, Max, Min, ValidateNested } from 'class-validator';

import { PropertyOptionDto } from './property-option.dto';

export class CreatePropertyOptionDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  version: number;

  @ValidateNested()
  @Type(() => PropertyOptionDto)
  option: PropertyOptionDto;
}
