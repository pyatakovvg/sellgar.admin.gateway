import { Transform } from 'class-transformer';
import { IsInt, IsString, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class UpdateUnitDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  version: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  symbol?: string;
}
