import { IsNumber, IsString } from 'class-validator';

export class PriceDto {
  @IsNumber()
  value: number;

  @IsString()
  currencyCode: string;
}
