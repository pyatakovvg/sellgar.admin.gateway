import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { SessionService } from '@/api/identity_srv/api/session/service/session.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthCookieService } from '../cookie/auth-cookie.service';
import { AuthSessionContext, AuthSessionContextService } from '../context/auth-session-context.service';

type AuthenticatedRequest = Request & {
  user?: {
    uuid: string;
  };
};

type VerifiedSession = {
  data: {
    status: string;
    userId?: string;
  };
  meta: Record<string, never>;
};

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService,
    private readonly authCookieService: AuthCookieService,
    private readonly authSessionContextService: AuthSessionContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();
    const sessionSecret = this.authCookieService.read(request);

    if (!sessionSecret) {
      throw new UnauthorizedException();
    }

    const sessionContext = await this.getSessionContext(request);
    const session = await this.resolveSession(sessionSecret, sessionContext, response);

    if (session.data.status !== 'active' || !session.data.userId) {
      this.authCookieService.clear(response);
      throw new UnauthorizedException({
        code: session.data.status,
      });
    }

    request.user = {
      uuid: session.data.userId,
    };

    return true;
  }

  private async resolveSession(
    sessionSecret: string,
    sessionContext: AuthSessionContext,
    response: Response,
  ): Promise<VerifiedSession> {
    const session = await this.verify(sessionSecret, sessionContext);

    if (session.data.status !== 'renew_required') {
      return session;
    }

    const renewedSession = await this.sessionService.renew({
      sessionSecret,
      fingerprint: sessionContext.fingerprint,
      clientType: sessionContext.clientType,
      gateway: sessionContext.gateway,
    });

    if (!renewedSession) {
      const verifiedSession = await this.verify(sessionSecret, sessionContext);

      if (verifiedSession.data.status === 'active' && verifiedSession.data.userId) {
        return verifiedSession;
      }

      this.authCookieService.clear(response);
      throw new UnauthorizedException({
        code: 'renew_failed',
      });
    }

    this.authCookieService.set(response, renewedSession.sessionSecret);

    return {
      data: {
        status: 'active',
        userId: renewedSession.userId,
      },
      meta: {},
    };
  }

  private async verify(sessionSecret: string, sessionContext: AuthSessionContext): Promise<VerifiedSession> {
    return await this.sessionService.verify({
      sessionSecret,
      fingerprint: sessionContext.fingerprint,
      clientType: sessionContext.clientType,
      gateway: sessionContext.gateway,
    });
  }

  private async getSessionContext(request: Request): Promise<AuthSessionContext> {
    try {
      return await this.authSessionContextService.build(request);
    } catch {
      throw new UnauthorizedException({
        code: 'invalid_session_context',
      });
    }
  }
}
