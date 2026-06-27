import { IsOptional, IsString } from 'class-validator';

export class SessionEntity {
  @IsString()
  sessionId: string;

  @IsString()
  sessionSecret: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
