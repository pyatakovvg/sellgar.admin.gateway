import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { CookiesService } from '../services/cookies.service';

import { AgentService } from '@/common/services/agent/agent.service';
import { FingerprintService } from '@/common/services/fingerprint/fingerprint.service';

import { TokenService } from '@/api/identity_srv/token/service/token.service';
import { SessionService } from '@/api/identity_srv/session/service/session.service';

import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

interface ICookie {
  sessionUuid: string;
  accessToken: string;
  refreshToken: string;
  fingerprint: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookiesService,
    private readonly sessionService: SessionService,
    private readonly agentService: AgentService,
    private readonly fingerprintService: FingerprintService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const cookie = await this.getCookie(request);
    console.info('Cookie:', cookie);

    console.info('Refresh token start:', {
      sessionUuid: cookie.sessionUuid,
      token: cookie.refreshToken,
    });
    const refreshToken = await this.tokenService.verifyRefreshToken({
      sessionUuid: cookie.sessionUuid,
      token: cookie.refreshToken,
    });

    console.info('Refresh token result:', refreshToken);

    if (refreshToken.data.status === 'EXPIRED') {
      await this.restoreSession(request, response, cookie);
      return true;
    } else if (refreshToken.data.status === 'ERROR') {
      throw new UnauthorizedException();
    }

    const accessToken = await this.tokenService.verifyAccessToken({ token: cookie.accessToken });

    console.info('Access token result:', accessToken);

    if (accessToken.data.status === 'VERIFY') {
      request.user = accessToken.data.user;

      return true;
    } else if (accessToken.data.status === 'EXPIRED') {
      await this.refreshSession(request, response, cookie);

      return true;
    } else if (accessToken.data.status === 'ERROR') {
      throw new UnauthorizedException();
    }

    return true;
  }

  private async getCookie(request: Request): Promise<ICookie> {
    const cookie = request.cookies[this.config.get('AUTH_COOKIE')];

    const agent = await this.agentService.get(request);
    const fingerprint = await this.fingerprintService.generate({
      userAgent: agent.userAgent,
      deviceId: agent.deviceId,
      deviceName: agent.deviceName,
    });

    const sessionUuid = this.cookieService.extractSessionUuidFromCookie(cookie);
    const accessToken = this.cookieService.extractAccessTokenFromCookie(cookie);
    const refreshToken = this.cookieService.extractRefreshTokenFromCookie(cookie);

    return {
      sessionUuid,
      accessToken,
      refreshToken,
      fingerprint,
    };
  }

  private async restoreSession(request: Request, response: Response, cookie: ICookie) {
    console.info('Restore session start', {
      sessionUuid: cookie.sessionUuid,
      refreshToken: cookie.refreshToken,
      fingerprint: cookie.fingerprint,
    });

    const newSession = await this.sessionService.restore({
      sessionUuid: cookie.sessionUuid,
      refreshToken: cookie.refreshToken,
      fingerprint: cookie.fingerprint,
    });

    console.info('New session:', newSession);

    const payload = await this.tokenService.verifyAccessToken({ token: newSession.accessToken });

    console.info('Verify session:', payload);

    request.user = payload.data.user;

    response.cookie(this.config.get('AUTH_COOKIE'), JSON.stringify(newSession), {
      maxAge: this.config.get('AUTH_COOKIE_EXTEND'),
      httpOnly: true,
      secure: true,
    });
  }

  private async refreshSession(request: Request, response: Response, cookie: ICookie) {
    const newSession = await this.sessionService.refresh({
      sessionUuid: cookie.sessionUuid,
      refreshToken: cookie.refreshToken,
      fingerprint: cookie.fingerprint,
    });

    const payload = await this.tokenService.verifyAccessToken({ token: newSession.accessToken });

    request.user = payload.data.user;

    response.cookie(this.config.get('AUTH_COOKIE'), JSON.stringify(newSession), {
      maxAge: this.config.get('AUTH_COOKIE_EXTEND'),
      httpOnly: true,
      secure: true,
    });
  }
}
