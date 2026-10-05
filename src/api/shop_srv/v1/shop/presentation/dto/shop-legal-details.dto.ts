import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ShopLegalForm } from '../../domain/shop-legal-form.enum';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class ShopLegalDetailsDto {
  @IsEnum(ShopLegalForm)
  legalForm: ShopLegalForm;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  legalName?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  entrepreneurFullName?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  registrationAuthority?: string | null;

  @IsString()
  @Matches(/^(?:\d{10}|\d{12})$/)
  inn: string;

  @IsOptional()
  @IsString()
  @Length(9, 9)
  @Matches(/^\d+$/)
  kpp?: string | null;

  @IsOptional()
  @IsString()
  @Length(13, 13)
  @Matches(/^\d+$/)
  ogrn?: string | null;

  @IsOptional()
  @IsString()
  @Length(15, 15)
  @Matches(/^\d+$/)
  ogrnip?: string | null;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  legalAddress: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2048)
  actualLocation?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsEmail()
  @MaxLength(320)
  email?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsPhoneNumber()
  phone?: string | null;
}
