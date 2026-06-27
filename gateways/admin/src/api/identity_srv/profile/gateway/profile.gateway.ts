import { firstValueFrom } from 'rxjs';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { ProfileEntity } from '../profile.entity';

@Injectable()
export class ProfileGateway {
  constructor(@Inject('IDENTITY_SERVICE') private readonly identityProxy: ClientProxy) {}

  async getByUserUuid(userUuid: string) {
    const message = this.identityProxy.send({ cmd: 'identity.person.get:userUuid' }, { userUuid });
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ProfileEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
