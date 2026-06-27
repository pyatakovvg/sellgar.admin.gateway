import { Module } from '@nestjs/common';

import { UserGateway } from './gateway/user.gateway';

@Module({
  exports: [UserGateway],
  providers: [UserGateway],
})
export class UserModule {}
