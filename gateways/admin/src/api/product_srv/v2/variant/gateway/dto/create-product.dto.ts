import { Type } from 'class-transformer';
import { ValidateNested, IsUUID, IsString, IsOptional, IsNumber } from 'class-validator';

class ProductVariantPrice {
  @IsUUID()
  @IsOptional()
  uuid?: string;

  @IsNumber()
  price: number;
}

class ProductVariant {
  @IsUUID()
  @IsOptional()
  uuid?: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @ValidateNested()
  @Type(() => ProductVariantPrice)
  price: ProductVariantPrice;
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

  @ValidateNested()
  @Type(() => ProductVariant)
  variants: ProductVariant[];
}
