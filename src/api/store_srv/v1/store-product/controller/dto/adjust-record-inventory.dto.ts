import { IsOptional, IsUUID } from 'class-validator';
import { AdjustRecordInventoryCommand } from '../../service/command/adjust-record-inventory.command';
export class AdjustRecordInventoryDto extends AdjustRecordInventoryCommand {
  @IsOptional()
  @IsUUID()
  recordUuid: string;
}
