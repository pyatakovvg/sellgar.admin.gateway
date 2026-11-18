import { Expose } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Matches, Min } from 'class-validator';

export class CartItemMutationEntity {
  @Expose()
  @IsUUID()
  cartUuid: string;

  @Expose()
  @IsUUID()
  recordUuid: string;

  @Expose({ name: 'version' })
  @IsString()
  @Matches(/^[1-9]\d*$/)
  cartVersion: string;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
