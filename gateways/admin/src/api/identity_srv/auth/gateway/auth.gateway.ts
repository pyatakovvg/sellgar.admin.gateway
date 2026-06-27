import { firstValueFrom } from 'rxjs';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { LoginDto } from './dto/login.dto';

import { AuthEntity } from '../auth.entity';

@Injectable()
export class AuthGateway {
  constructor(@Inject('IDENTITY_SERVICE') private readonly identityProxy: ClientProxy) {}

  async login(dto: LoginDto) {
    const message = this.identityProxy.send({ cmd: 'identity.auth.login' }, dto);
    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(AuthEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }
}
