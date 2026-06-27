import { Controller, Post, Body, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';

import { LoginDto } from './dto/login.dto';

import { AuthService } from '../service/auth.service';
import { SessionService } from '../../session/service/session.service';

import { Public } from '@/common/decorators/public.decorator';
import { AuthUuid } from '@/common/decorators/auth-uuid.decorator';

import { AuthCookieService } from '@/common/services/auth-cookie.service';
import { AgentService } from '@/common/services/agent/agent.service';
import { FingerprintService } from '@/common/services/fingerprint/fingerprint.service';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly authCookieService: AuthCookieService,
    private readonly agentService: AgentService,
    private readonly fingerprintService: FingerprintService,
  ) {}

  @Public()
  @Post('sign-in')
  async signIn(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
    const user = await this.authService.login(dto);

    const agent = await this.agentService.get(req);
    const fingerprint = await this.fingerprintService.generate({
      userAgent: agent.userAgent,
      deviceId: agent.deviceId,
      deviceName: agent.deviceName,
    });

    const session = await this.sessionService.create({ userUuid: user.uuid, device: agent.deviceName, fingerprint });

    res.cookie(this.authCookieService.getName(), JSON.stringify(session), this.authCookieService.getOptions());

    res.status(200).json({ data: null, meta: {} });
  }

  @Post('sign-out')
  async signOut(@AuthUuid() uuid: string, @Req() req: Request, @Res() res: Response) {
    const agent = await this.agentService.get(req);
    const fingerprint = await this.fingerprintService.generate({
      userAgent: agent.userAgent,
      deviceId: agent.deviceId,
      deviceName: agent.deviceName,
    });

    const session = await this.sessionService.find({ userUuid: uuid, fingerprint });

    if (!session) {
      throw new UnauthorizedException();
    }

    await this.sessionService.remove({
      uuid: session.sessionUuid,
      userUuid: uuid,
      fingerprint,
    });

    res.cookie(this.authCookieService.getName(), null, this.authCookieService.getOptions());

    res.status(200).json({ data: null, meta: {} });
  }
}
