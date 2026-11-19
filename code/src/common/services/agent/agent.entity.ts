import { IsString } from 'class-validator';

export class AgentEntity {
  @IsString()
  userAgent: string;

  @IsString()
  osName: string;

  @IsString()
  clientName: string;

  @IsString()
  deviceId: string;

  @IsString()
  deviceName: string;
}
