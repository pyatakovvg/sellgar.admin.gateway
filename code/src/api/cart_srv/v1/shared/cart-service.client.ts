import { BadGatewayException, GatewayTimeoutException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';

import { CART_COMMAND_SERVICE } from './cart-service.constants';

@Injectable()
export class CartServiceClient {
  constructor(@Inject(CART_COMMAND_SERVICE) private readonly client: ClientProxy) {}

  async request<T extends object>(command: string, payload: object, ResultType: ClassConstructor<T>): Promise<T> {
    let result: unknown;
    try {
      result = await firstValueFrom(this.client.send({ cmd: command }, payload).pipe(timeout(5000)));
    } catch (error) {
      if (error instanceof TimeoutError) throw new GatewayTimeoutException('Cart service did not respond');
      throw error;
    }
    if (!result || typeof result !== 'object' || Array.isArray(result))
      throw new BadGatewayException('Invalid Cart service response');
    const entity = plainToInstance(ResultType, result, { excludeExtraneousValues: true });
    if ((await validate(entity)).length) throw new BadGatewayException('Invalid Cart service response');
    return entity;
  }
}
