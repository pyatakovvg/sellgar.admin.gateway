import { Module } from '@nestjs/common';

import { SessionModule } from '../session/session.module';
import { SessionAuthModule } from '../../helpers/session-auth/session-auth.module';

import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { AuthGateway } from './gateway/auth.gateway';

@Module({
  imports: [SessionModule, SessionAuthModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGateway],
})
export class AuthModule {}
