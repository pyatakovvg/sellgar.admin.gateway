import { Module } from '@nestjs/common';

import { SessionService } from './service/session.service';
import { SessionGateway } from './gateway/session.gateway';

@Module({
  providers: [SessionService, SessionGateway],
  exports: [SessionService],
})
export class SessionModule {}
