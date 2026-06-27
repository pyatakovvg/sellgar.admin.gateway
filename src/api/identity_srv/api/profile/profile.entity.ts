import { IsUUID, IsString, IsDateString } from 'class-validator';

export class ProfileEntity {
  @IsUUID()
  uuid: string;

  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsString()
  patronymic: string;

  @IsDateString()
  birthday: Date;

  @IsString()
  sex: 'MALE' | 'FEMALE';

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}
