import { Module } from '@nestjs/common';

import { TokenService } from './service/token.service';
import { TokenGateway } from './gateway/token.gateway';

@Module({
  providers: [TokenService, TokenGateway],
  exports: [TokenService],
})
export class TokenModule {}
