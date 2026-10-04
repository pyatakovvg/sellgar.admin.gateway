import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

import { BrandImageDto } from './brand-image.dto';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CreateBrandDto {
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BrandImageDto)
  images?: BrandImageDto[];
}
