import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CookiesService } from '@/common/services/cookies.service';
import { AuthCookieService } from '@/common/services/auth-cookie.service';
import { AgentService } from '@/common/services/agent/agent.service';
import { FingerprintService } from '@/common/services/fingerprint/fingerprint.service';

import { TokenModule } from '@/api/identity_srv/token/token.module';
import { SessionModule } from '@/api/identity_srv/session/session.module';
import { ApiProductV2Module } from '@/api/product_srv/v2/api.module';
import { validateEnv } from '@/config/env.validation';

import { IdentitySrvModule } from '@/api/identity_srv/identity-srv.module';

@Module({
  imports: [
    TokenModule,
    SessionModule,
    IdentitySrvModule,
    ApiProductV2Module,

    HttpModule.register({
      global: true,
    }),
    ConfigModule.forRoot({
      envFilePath: './.env',
      cache: true,
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
  controllers: [],
  providers: [
    CookiesService,
    AuthCookieService,
    AgentService,
    FingerprintService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
