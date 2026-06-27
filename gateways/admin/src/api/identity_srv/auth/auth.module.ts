import { Module } from '@nestjs/common';

import { SessionModule } from '../session/session.module';

import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { AuthGateway } from './gateway/auth.gateway';

import { AgentService } from '@/common/services/agent/agent.service';
import { FingerprintService } from '@/common/services/fingerprint/fingerprint.service';

@Module({
  imports: [SessionModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGateway, AgentService, FingerprintService],
})
export class AuthModule {}
