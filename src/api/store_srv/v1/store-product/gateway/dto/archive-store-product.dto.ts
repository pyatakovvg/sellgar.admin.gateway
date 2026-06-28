import { IsNumber, IsUUID } from 'class-validator';

export class ArchiveStoreProductDto {
  @IsUUID()
  commandId: string;

  @IsUUID()
  uuid: string;

  @IsNumber()
  expectedVersion: number;
}
