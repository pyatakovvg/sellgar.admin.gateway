import { IsOptional, IsUUID } from 'class-validator';
import { UpdateStoreProductCommand } from '../../service/command/update-store-product.command';

export class UpdateStoreProductDto extends UpdateStoreProductCommand {
  @IsOptional()
  @IsUUID()
  uuid: string;
}
