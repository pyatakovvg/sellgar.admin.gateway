import { Type, Expose } from 'class-transformer';
import { IsDateString, IsNumber, IsString, ValidateNested } from 'class-validator';

export class CurrencyEntity {
  @Expose()
  @IsString()
  code: string;

  @Expose()
  @IsString()
  value: string;

  @Expose()
  @IsNumber()
  order: number;

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

export class CurrencyResultEntity {
  @Expose()
  @ValidateNested()
  @Type(() => CurrencyEntity)
  data: CurrencyEntity[];

  @Expose()
  @ValidateNested()
  @Type(() => MetaEntity)
  meta: MetaEntity;
}
