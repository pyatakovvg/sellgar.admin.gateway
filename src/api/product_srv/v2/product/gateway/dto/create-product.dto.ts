import { Type } from 'class-transformer';
import { ValidateNested, IsUUID, IsString, IsOptional } from 'class-validator';

export class ProductPropertyDto {
  @IsUUID()
  @IsOptional()
  uuid?: string;

  @IsUUID()
  propertyUuid: string;

  @IsString()
  value: string;
}

class ProductVariant {
  @IsUUID()
  @IsOptional()
  uuid?: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @ValidateNested({ each: true })
  @Type(() => ProductPropertyDto)
  properties: ProductPropertyDto[];
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsUUID()
  categoryUuid: string;

  @IsUUID()
  brandUuid: string;

  @ValidateNested({ each: true })
  @Type(() => ProductPropertyDto)
  @IsOptional()
  properties?: ProductPropertyDto[];

  @ValidateNested({ each: true })
  @Type(() => ProductVariant)
  variants: ProductVariant[];
}
