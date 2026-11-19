import { IsIn, IsInt, IsISO8601, IsObject, IsString, IsUUID, Min } from 'class-validator';

import { REALTIME_CHANNELS, RealtimeChannel } from '../realtime.constants';

export class DeliveryRequestDto {
  @IsUUID()
  eventUuid: string;

  @IsString()
  eventType: string;

  @IsInt()
  @Min(1)
  schemaVersion: number;

  @IsISO8601()
  occurredAt: string;

  @IsIn(REALTIME_CHANNELS)
  channel: RealtimeChannel;

  @IsObject()
  payload: Record<string, unknown>;
}
