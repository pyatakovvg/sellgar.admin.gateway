import { firstValueFrom } from 'rxjs';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { UserEntity } from '../user.entity';

@Injectable()
export class UserGateway {
  constructor(@Inject('IDENTITY_SERVICE') private readonly identityProxy: ClientProxy) {}

  async getByUserUuid(userUuid: string) {
    const message = this.identityProxy.send({ cmd: 'identity.user.get' }, { uuid: userUuid });
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(UserEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
