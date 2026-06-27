import { Type, Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested, IsNumber, IsDateString } from 'class-validator';

export class CategoryEntity {
  @IsUUID()
  @Expose()
  uuid: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  parentUuid?: string;

  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryEntity)
  parent?: CategoryEntity;

  @Expose()
  @ValidateNested()
  @Type(() => CategoryEntity)
  children: CategoryEntity[];

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

class MetaEntity {}

export class CategoryResultEntity {
  @Expose()
  @ValidateNested()
  @Type(() => CategoryEntity)
  data: CategoryEntity[];

  meta: MetaEntity;
}
