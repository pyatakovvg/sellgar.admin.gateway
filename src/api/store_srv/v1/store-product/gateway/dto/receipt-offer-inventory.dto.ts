import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class ReceiptOfferInventoryDto {
  @IsUUID()
  commandId: string;

  @IsUUID()
  offerUuid: string;

  @IsInt()
  expectedVersion: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string | null;

  @IsOptional()
  @IsUUID()
  sourceUuid?: string | null;

  @IsOptional()
  @IsUUID()
  createdBy?: string | null;
}
