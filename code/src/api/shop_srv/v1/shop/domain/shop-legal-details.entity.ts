import { Expose } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, Matches } from 'class-validator';

import { ShopLegalForm } from './shop-legal-form.enum';

export class ShopLegalDetailsEntity {
  @Expose()
  @IsEnum(ShopLegalForm)
  legalForm: ShopLegalForm;

  @Expose()
  @IsOptional()
  @IsString()
  legalName: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  entrepreneurFullName: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  registrationAuthority: string | null;

  @Expose()
  @IsString()
  @Matches(/^(?:\d{10}|\d{12})$/)
  inn: string;

  @Expose()
  @IsOptional()
  @IsString()
  kpp: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  ogrn: string | null;

  @Expose()
  @IsOptional()
  @IsString()
  ogrnip: string | null;

  @Expose()
  @IsString()
  legalAddress: string;

  @Expose()
  @IsOptional()
  @IsString()
  actualLocation: string | null;

  @Expose()
  @IsOptional()
  @IsEmail()
  email: string | null;

  @Expose()
  @IsOptional()
  @IsPhoneNumber()
  phone: string | null;
}
