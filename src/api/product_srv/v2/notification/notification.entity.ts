import { Type, Expose } from 'class-transformer';
import { IsUUID, IsString, ValidateNested, IsNumber, IsDateString } from 'class-validator';

export class NotificationEntity {
  @IsUUID()
  @Expose()
  uuid: string;

  @IsString()
  @Expose()
  code: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsDateString()
  updatedAt: string;
}

class MetaEntity {
  @Expose()
  @IsNumber()
  totalRows: number;
}

export class BrandResultEntity {
  @Expose()
  @ValidateNested()
  @Type(() => NotificationEntity)
  data: NotificationEntity[];

  @Expose()
  @ValidateNested()
  @Type(() => MetaEntity)
  meta: MetaEntity;
}
