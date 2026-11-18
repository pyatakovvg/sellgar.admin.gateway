import { Expose, Type } from 'class-transformer';
import { IsArray, IsDefined, IsInt, Max, Min, ValidateNested } from 'class-validator';

import { CartMetadataEntity, CartShopEntity } from './cart.entity';

class CartSummaryEntity extends CartMetadataEntity {
  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => CartShopEntity)
  shop: CartShopEntity;

  /** Число отдельных позиций корзины, без суммирования quantity. */
  @Expose()
  @IsInt()
  @Min(0)
  itemsCount: number;
}

class CartPageMetaEntity {
  @Expose()
  @IsInt()
  @Min(0)
  totalRows: number;

  @Expose()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @Expose()
  @IsInt()
  @Min(0)
  offset: number;
}

export class CartPageEntity {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartSummaryEntity)
  data: CartSummaryEntity[];

  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => CartPageMetaEntity)
  meta: CartPageMetaEntity;
}
