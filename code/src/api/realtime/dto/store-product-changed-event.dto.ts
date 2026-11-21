import { IsIn, IsInt, IsISO8601, IsObject, IsString, IsUUID, Min } from 'class-validator';

export class StoreProductChangedEventDto {
  @IsUUID()
  eventUuid: string;

  @IsIn(['store.product.created', 'store.product.updated'])
  eventType: 'store.product.created' | 'store.product.updated';

  @IsInt()
  @IsIn([2, 3])
  schemaVersion: number;

  @IsString()
  producer: string;

  @IsIn(['store_product'])
  aggregateType: 'store_product';

  @IsUUID()
  aggregateUuid: string;

  @IsInt()
  @Min(1)
  aggregateVersion: number;

  @IsISO8601()
  occurredAt: string;

  @IsObject()
  payload: Record<string, unknown>;
}
