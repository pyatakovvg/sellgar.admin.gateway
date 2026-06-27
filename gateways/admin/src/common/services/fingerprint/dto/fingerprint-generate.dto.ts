import { IsString } from 'class-validator';

export class FingerprintGenerateDto {
  @IsString()
  userAgent: string;

  @IsString()
  deviceName: string;

  @IsString()
  deviceId: string;
}
