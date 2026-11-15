import { IsIn, IsInt, IsISO8601, IsObject, IsString, IsUUID, Min } from 'class-validator';

export class CategoryChangedEventDto {
  @IsUUID()
  eventUuid: string;

  @IsIn(['store.category.created', 'store.category.updated'])
  eventType: 'store.category.created' | 'store.category.updated';

  @IsInt()
  @Min(1)
  schemaVersion: number;

  @IsString()
  producer: string;

  @IsIn(['category'])
  aggregateType: 'category';

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
