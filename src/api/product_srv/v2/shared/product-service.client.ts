import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { firstValueFrom } from 'rxjs';

import { PRODUCT_COMMAND_SERVICE } from './product-service.constants';

@Injectable()
export class ProductServiceClient {
  constructor(@Inject(PRODUCT_COMMAND_SERVICE) private readonly client: ClientProxy) {}

  async request<TResult extends object, TPayload extends object>(
    command: string,
    payload: TPayload,
    ResultType: ClassConstructor<TResult>,
  ): Promise<TResult> {
    const result = await firstValueFrom(this.client.send<TResult, TPayload>({ cmd: command }, payload));
    const instance = plainToInstance(ResultType, result, { excludeExtraneousValues: true });

    await validateOrReject(instance);

    return instance;
  }
}
