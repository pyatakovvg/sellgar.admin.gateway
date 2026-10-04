import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class UpdatePropertyDto {
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

  @IsOptional()
  @IsString()
  description?: string | null;
}
