import { firstValueFrom } from 'rxjs';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { LoginDto } from './dto/login.dto';

import { SessionEntity } from '../../session/session.entity';

@Injectable()
export class AuthGateway {
  constructor(@Inject('IDENTITY_SERVICE') private readonly identityProxy: ClientProxy) {}

  async signIn(
    dto: LoginDto & { device: string; fingerprint: string; clientType: string; gateway: string },
  ): Promise<SessionEntity> {
    const message = this.identityProxy.send({ cmd: 'identity.auth.signIn' }, dto);
    const result = await firstValueFrom(message).catch((error) => {
      if (this.isUnauthorized(error)) {
        throw new UnauthorizedException({
          code: 'invalid_credentials',
        });
      }

      throw error;
    });
    const resultInstance = plainToInstance(SessionEntity, {
      sessionId: result.uuid,
      sessionSecret: result.sessionSecret,
      userId: result.userId,
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  private isUnauthorized(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const payload = error as Record<string, unknown>;
    const nested = typeof payload.error === 'object' && payload.error ? (payload.error as Record<string, unknown>) : {};

    return payload.statusCode === 401 || nested.statusCode === 401 || payload.code === 'invalid_credentials';
  }
}
