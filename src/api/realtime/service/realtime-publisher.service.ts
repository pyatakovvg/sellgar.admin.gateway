import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { firstValueFrom } from 'rxjs';

import { DeliveryRequestDto } from '../dto/delivery-request.dto';
import { DELIVERY_REQUESTED_PATTERN, REALTIME_EVENT_SERVICE } from '../realtime.constants';

@Injectable()
export class RealtimePublisherService {
  constructor(@Inject(REALTIME_EVENT_SERVICE) private readonly eventClient: ClientProxy) {}

  async publish(input: DeliveryRequestDto): Promise<void> {
    const delivery = plainToInstance(DeliveryRequestDto, input);

    await validateOrReject(delivery, { forbidNonWhitelisted: true, whitelist: true });
    await firstValueFrom(this.eventClient.emit(DELIVERY_REQUESTED_PATTERN, delivery));
  }
}
