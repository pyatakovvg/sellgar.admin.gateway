import { firstValueFrom } from 'rxjs';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { FindSessionDto } from './dto/find-session.dto';
import { RemoveSessionDto } from './dto/remove-session.dto';
import { VerifySessionDto } from './dto/verify-session.dto';
import { RenewSessionDto } from './dto/renew-session.dto';

import { SessionEntity } from '../session.entity';

@Injectable()
export class SessionGateway {
  constructor(@Inject('IDENTITY_SERVICE') private readonly identityProxy: ClientProxy) {}

  async find(dto: FindSessionDto): Promise<SessionEntity | null> {
    const message = this.identityProxy.send({ cmd: 'identity.session.find' }, dto);
    const result = await firstValueFrom(message);

    if (!result) {
      return null;
    }

    const resultInstance = plainToInstance(SessionEntity, {
      sessionId: result.uuid,
      sessionSecret: '',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async verify(dto: VerifySessionDto) {
    const message = this.identityProxy.send({ cmd: 'identity.session.verify' }, dto);

    return await firstValueFrom(message);
  }

  async renew(dto: RenewSessionDto): Promise<SessionEntity | null> {
    const message = this.identityProxy.send({ cmd: 'identity.session.renew' }, dto);
    const result = await firstValueFrom(message);

    if (!result) {
      return null;
    }

    const resultInstance = plainToInstance(SessionEntity, {
      sessionId: result.uuid,
      sessionSecret: result.sessionSecret,
      userId: result.userId,
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async remove(dto: RemoveSessionDto) {
    const message = this.identityProxy.send({ cmd: 'identity.session.revoke' }, dto);
    const result = await firstValueFrom(message);

    return Boolean(result);
  }
}
