import { IsNumber, IsString } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  code: string;

  @IsString()
  value: string;

  @IsNumber()
  order: number;
}
