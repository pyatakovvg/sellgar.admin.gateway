import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class CartPriceEntity {
  @Expose()
  @IsUUID()
  uuid: string;

  @Expose()
  @IsString()
  @Matches(/^\d+\.\d{2}$/)
  value: string;

  @Expose()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currencyCode: string;
}

export class CartItemEntity {
  @Expose()
  @IsUUID()
  recordUuid: string;

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsUUID()
  offerUuid: string | null;

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsUUID()
  productUuid: string | null;

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsUUID()
  variantUuid: string | null;

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  productName: string | null;

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  variantName: string | null;

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  article: string | null;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  clarifications: string[];

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsUUID()
  imageUuid: string | null;

  @Expose()
  @IsInt()
  @Min(1)
  quantity: number;

  @Expose()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  version: string;

  @Expose({ name: 'available' })
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  @Min(0)
  availableQuantity: number | null;

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsDefined()
  @ValidateNested()
  @Type(() => CartPriceEntity)
  price: CartPriceEntity | null;

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Matches(/^\d+\.\d{2}$/)
  subtotal: string | null;

  @Expose()
  @IsArray()
  @IsIn(
    [
      'not_sold',
      'hidden',
      'sync_pending',
      'price_missing',
      'currency_mismatch',
      'out_of_stock',
      'insufficient_stock',
      'checkout_in_progress',
    ],
    { each: true },
  )
  reasons: string[];

  @Expose()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  message: string | null;

  @Expose()
  @IsBoolean()
  canCheckout: boolean;

  @Expose()
  @IsBoolean()
  canOpenProduct: boolean;

  @Expose()
  @IsBoolean()
  canIncrease: boolean;

  @Expose()
  @IsBoolean()
  canDecrease: boolean;

  @Expose()
  @IsBoolean()
  canRemove: boolean;
}
