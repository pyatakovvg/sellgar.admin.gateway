import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CreateUnitDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  code: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  symbol: string;
}
