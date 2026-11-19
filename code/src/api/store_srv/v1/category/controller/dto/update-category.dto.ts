import { Expose } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

import { CategoryFieldsDto } from './category-fields.dto';

export class UpdateCategoryDto extends CategoryFieldsDto {
  @Expose()
  @IsInt()
  @Min(1)
  expectedVersion: number;
}
