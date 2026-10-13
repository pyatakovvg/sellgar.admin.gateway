import { IsOptional, IsUUID } from 'class-validator';
import { ArchiveStoreProductCommand } from '../../service/command/archive-store-product.command';

export class ArchiveStoreProductDto extends ArchiveStoreProductCommand {
  @IsOptional()
  @IsUUID()
  uuid: string;
}
