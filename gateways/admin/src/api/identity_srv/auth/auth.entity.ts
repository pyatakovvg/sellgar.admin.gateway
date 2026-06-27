import { IsString } from 'class-validator';

export class AuthEntity {
  @IsString()
  uuid: string;
}
