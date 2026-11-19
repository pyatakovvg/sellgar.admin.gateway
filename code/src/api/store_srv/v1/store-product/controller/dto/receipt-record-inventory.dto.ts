import { IsOptional, IsUUID } from 'class-validator';
import { InventoryMovementCommand } from '../../service/command/inventory-movement.command';
export class ReceiptRecordInventoryDto extends InventoryMovementCommand {
  @IsOptional()
  @IsUUID()
  recordUuid: string;
}
