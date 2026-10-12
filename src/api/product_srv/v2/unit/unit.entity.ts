import { Expose, Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UnitEntity {
  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  symbol: string;

  @Expose()
  @IsOptional()
  @IsString()
  description: string | null;

  @Expose()
  @IsInt()
  version: number;

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

export class UnitPageEntity {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnitEntity)
  items: UnitEntity[];

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
