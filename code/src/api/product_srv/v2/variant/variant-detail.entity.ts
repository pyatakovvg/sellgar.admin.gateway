import { Expose } from 'class-transformer';
import { IsInt, IsUUID } from 'class-validator';
import { VariantEntity } from './variant.entity';

export class VariantDetailEntity extends VariantEntity {
  @Expose()
  @IsUUID()
  productUuid: string;
  @Expose()
  @IsInt()
  version: number;
  @Expose()
  @IsUUID()
  typeUuid: string;
  @Expose()
  @IsInt()
  typeVersion: number;
}
