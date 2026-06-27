import { Controller, Post, Body, Req, Res, Logger } from '@nestjs/common';
import { Response, Request } from 'express';

import { LoginDto } from './dto/login.dto';

import { AuthService } from '../service/auth.service';
import { SessionService } from '../../session/service/session.service';

import { Public } from '../../../helpers/session-auth/decorators/public.decorator';

import { AuthCookieService } from '../../../helpers/session-auth/cookie/auth-cookie.service';
import { AuthSessionContextService } from '../../../helpers/session-auth/context/auth-session-context.service';

@Controller('v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly authCookieService: AuthCookieService,
    private readonly authSessionContextService: AuthSessionContextService,
  ) {}

  @Public()
  @Post('sign-in')
  async signIn(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
    const sessionContext = await this.authSessionContextService.build(req);

    const session = await this.authService.signIn({
      ...dto,
      device: sessionContext.device,
      fingerprint: sessionContext.fingerprint,
      clientType: sessionContext.clientType,
      gateway: sessionContext.gateway,
    });

    this.authCookieService.set(res, session.sessionSecret);

    res.status(200).json({ data: null, meta: {} });
  }

  @Public()
  @Post('sign-out')
  async signOut(@Req() req: Request, @Res() res: Response) {
    const sessionSecret = this.authCookieService.read(req);

    try {
      if (sessionSecret) {
        await this.revokeSession(req, sessionSecret);
      }
    } catch (error) {
      this.logger.warn(
        'Failed to revoke admin session during sign-out',
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.authCookieService.clear(res);
    }

    res.status(200).json({ data: null, meta: {} });
  }

  private async revokeSession(req: Request, sessionSecret: string): Promise<void> {
    const sessionContext = this.authSessionContextService.build(req);

    await this.sessionService.remove({
      sessionSecret,
      fingerprint: sessionContext.fingerprint,
      clientType: sessionContext.clientType,
      gateway: sessionContext.gateway,
    });
  }
}
