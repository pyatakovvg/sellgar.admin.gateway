import { ConfigService } from '@nestjs/config';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { CookiesService } from '../services/cookies.service';

import { AgentService } from '@/common/services/agent/agent.service';
import { FingerprintService } from '@/common/services/fingerprint/fingerprint.service';

import { TokenService } from '@/api/identity_srv/token/service/token.service';
import { SessionService } from '@/api/identity_srv/session/service/session.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly config: ConfigService,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookiesService,
    private readonly sessionService: SessionService,
    private readonly agentService: AgentService,
    private readonly fingerprintService: FingerprintService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const cookie = req.cookies[this.config.get('AUTH_COOKIE')];

    const agent = await this.agentService.get(req);
    const fingerprint = await this.fingerprintService.generate({
      userAgent: agent.userAgent,
      deviceId: agent.deviceId,
      deviceName: agent.deviceName,
    });

    const sessionUuid = this.cookieService.extractSessionUuidFromCookie(cookie);
    const expiresAt = this.cookieService.extractExpiresAtFromCookie(cookie);
    const accessToken = this.cookieService.extractAccessTokenFromCookie(cookie);
    const refreshToken = this.cookieService.extractRefreshTokenFromCookie(cookie);

    if (new Date() > new Date(expiresAt)) {
      const newSession = await this.sessionService.restore({
        sessionUuid,
        refreshToken,
        fingerprint,
      });

      res.cookie(this.config.get('AUTH_COOKIE'), JSON.stringify(newSession), {
        maxAge: this.config.get('AUTH_COOKIE_EXTEND'),
        httpOnly: true,
        secure: true,
      });
    }

    const payload = await this.tokenService.verifyAccessToken({ token: accessToken });

    if (payload.data.status === 'EXPIRED') {
      const newSession = await this.sessionService.refresh({
        sessionUuid,
        refreshToken,
        fingerprint,
      });

      res.cookie(this.config.get('AUTH_COOKIE'), JSON.stringify(newSession), {
        maxAge: this.config.get('AUTH_COOKIE_EXTEND'),
        httpOnly: true,
        secure: true,
      });
    }

    return next();
  }
}
