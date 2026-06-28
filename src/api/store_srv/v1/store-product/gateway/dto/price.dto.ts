import { IsString, Matches } from 'class-validator';

export class PriceDto {
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  value: string;

  @IsString()
  currencyCode: string;
}
