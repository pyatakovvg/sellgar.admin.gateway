import { IsString } from 'class-validator';

export class SessionEntity {
  @IsString()
  sessionUuid: string;

  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}
