import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class BrandImageEntity {
  @Expose()
  @IsUUID()
  imageUuid: string;

  @Expose()
  @Transform(({ value, obj }) => value ?? obj.image?.fileName, { toClassOnly: true })
  @IsString()
  fileName: string;

  @Expose()
  @IsInt()
  sortOrder: number;
}

export class BrandEntity {
  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description: string | null;

  @Expose()
  @IsInt()
  version: number;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BrandImageEntity)
  images: BrandImageEntity[];

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

export class BrandPageEntity {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BrandEntity)
  items: BrandEntity[];

  @Expose()
  @IsInt()
  total: number;

  @Expose()
  @IsInt()
  limit: number;

  @Expose()
  @IsInt()
  offset: number;
}
