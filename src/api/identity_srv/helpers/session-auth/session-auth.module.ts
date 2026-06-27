import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { SessionModule } from '../../api/session/session.module';

import { SessionAuthGuard } from './guards/session-auth.guard';
import { AuthSessionContextService } from './context/auth-session-context.service';
import { AuthCookieService } from './cookie/auth-cookie.service';

const sessionAuthProviders = [AuthSessionContextService, AuthCookieService];

@Module({
  imports: [SessionModule],
  providers: [
    ...sessionAuthProviders,
    SessionAuthGuard,
    {
      provide: APP_GUARD,
      useExisting: SessionAuthGuard,
    },
  ],
  exports: sessionAuthProviders,
})
export class SessionAuthModule {}
