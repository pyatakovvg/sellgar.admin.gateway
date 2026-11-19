import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { SessionModule } from '../session/session.module';
import { SessionAuthModule } from '../../helpers/session-auth/session-auth.module';

import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { AuthGateway } from './gateway/auth.gateway';
import { SocketTicketService } from './service/socket-ticket.service';

@Module({
  imports: [JwtModule.register({}), SessionModule, SessionAuthModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGateway, SocketTicketService],
})
export class AuthModule {}
