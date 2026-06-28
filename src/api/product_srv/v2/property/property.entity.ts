import { Type, Expose } from 'class-transformer';
import { IsUUID, IsString, IsOptional, ValidateNested, IsNumber, IsDateString } from 'class-validator';

import { UnitEntity } from '../unit/unit.entity';

export class PropertyEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsNumber()
  version: number;

  @Expose()
  @IsUUID()
  @IsOptional()
  groupUuid: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  unitUuid: string | null;

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
  @IsString()
  type: 'TEXT' | 'CHECKBOX' | 'RADIO' | 'DATE' | 'RANGE';

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => UnitEntity)
  unit: UnitEntity | null;

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

class MetaEntity {
  @Expose()
  @IsNumber()
  totalRows: number;
}

export class PropertyResultEntity {
  @Expose()
  @ValidateNested()
  @Type(() => PropertyEntity)
  data: PropertyEntity[];

  @Expose()
  @ValidateNested()
  @Type(() => MetaEntity)
  meta: MetaEntity;
}
