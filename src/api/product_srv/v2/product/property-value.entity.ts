import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PropertyValueEntity {
  @Expose()
  @IsOptional()
  @IsString()
  valueText: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  valueInteger: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  valueDecimal: string | null;

  @Expose()
  @IsOptional()
  @IsBoolean()
  valueBoolean: boolean | null;

  @Expose()
  @IsOptional()
  @IsString()
  valueDate: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  valueOptionCode: string | null;
}
