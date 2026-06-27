import { IsUUID, IsString, IsBoolean, IsDateString } from 'class-validator';

export class UserEntity {
  @IsUUID()
  uuid: string;

  @IsString()
  login: string;

  @IsBoolean()
  isBlocked: boolean;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}
