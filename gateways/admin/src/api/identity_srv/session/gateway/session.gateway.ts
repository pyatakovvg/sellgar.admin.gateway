import { firstValueFrom } from 'rxjs';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { FindSessionDto } from './dto/find-session.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { RestoreSessionDto } from './dto/restore-session.dto';
import { RemoveSessionDto } from './dto/remove-session.dto';

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
      sessionUuid: result.uuid,
      accessToken: '',
      refreshToken: '',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreateSessionDto): Promise<SessionEntity> {
    const message = this.identityProxy.send({ cmd: 'identity.session.create' }, dto);
    const result = await firstValueFrom(message);

    const resultInstance = plainToInstance(SessionEntity, {
      sessionUuid: result.uuid,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken.token,
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async refresh(dto: RefreshSessionDto): Promise<SessionEntity> {
    const message = this.identityProxy.send({ cmd: 'identity.session.refresh' }, dto);
    const result = await firstValueFrom(message);

    console.log('Session refresh:', result);

    const resultInstance = plainToInstance(SessionEntity, {
      sessionUuid: result.uuid,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken.token,
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async restore(dto: RestoreSessionDto) {
    const message = this.identityProxy.send({ cmd: 'identity.session.restore' }, dto);
    const result = await firstValueFrom(message);

    if (!result) {
      throw new UnauthorizedException();
    }

    const resultInstance = plainToInstance(SessionEntity, {
      sessionUuid: result.uuid,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken.token,
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async remove(dto: RemoveSessionDto) {
    const message = this.identityProxy.send({ cmd: 'identity.session.remove' }, dto);
    const result = await firstValueFrom(message);

    if (!result) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
