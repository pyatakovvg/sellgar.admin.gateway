import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

import { ProductTypeFieldDto } from './product-type-field.dto';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CreateProductTypeDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTypeFieldDto)
  productFields?: ProductTypeFieldDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTypeFieldDto)
  variantFields?: ProductTypeFieldDto[];
}
