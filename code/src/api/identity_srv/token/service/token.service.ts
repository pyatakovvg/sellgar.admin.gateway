import { Injectable } from '@nestjs/common';

import { VerifyAccessTokenDto } from './dto/verify-access-token.dto';
import { VerifyRefreshTokenDto } from './dto/verify-refresh-token.dto';

import { TokenGateway } from '../gateway/token.gateway';

@Injectable()
export class TokenService {
  constructor(private readonly sessionGateway: TokenGateway) {}

  verifyAccessToken(dto: VerifyAccessTokenDto) {
    return this.sessionGateway.verifyAccessToken(dto);
  }

  verifyRefreshToken(dto: VerifyRefreshTokenDto) {
    return this.sessionGateway.verifyRefreshToken(dto);
  }
}
