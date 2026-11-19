import { Expose } from 'class-transformer';
import { IsUUID, IsInt, Min } from 'class-validator';

export class ArchiveStoreProductCommand {
  @Expose()
  @IsUUID()
  uuid: string;
  @Expose()
  @IsInt()
  @Min(1)
  expectedVersion: number;
}
