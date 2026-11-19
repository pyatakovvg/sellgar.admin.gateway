import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { CategoryFieldsDto } from './category-fields.dto';

export class CreateCategoryDto extends CategoryFieldsDto {
  @Expose()
  @IsUUID()
  shopUuid: string;
}
