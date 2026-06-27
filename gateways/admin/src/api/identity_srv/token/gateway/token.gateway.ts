import { firstValueFrom } from 'rxjs';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { VerifyAccessTokenDto } from './dto/verify-access-token.dto';
import { VerifyRefreshTokenDto } from './dto/verify-refresh-token.dto';

@Injectable()
export class TokenGateway {
  constructor(@Inject('IDENTITY_SERVICE') private readonly identityProxy: ClientProxy) {}

  async verifyAccessToken(dto: VerifyAccessTokenDto) {
    const message = this.identityProxy.send({ cmd: 'identity.access-token.verify' }, dto);

    return await firstValueFrom(message);
  }

  async verifyRefreshToken(dto: VerifyRefreshTokenDto) {
    const message = this.identityProxy.send({ cmd: 'identity.refresh-token.verify' }, dto);

    return await firstValueFrom(message);
  }

  async refresh() {}

  async restore() {}

  async remove() {}
}
