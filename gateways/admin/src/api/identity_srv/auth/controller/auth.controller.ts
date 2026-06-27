import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';

import { LoginDto } from './dto/login.dto';

import { AuthService } from '../service/auth.service';
import { SessionService } from '../../session/service/session.service';

import { Public } from '@/common/decorators/public.decorator';
import { AuthUuid } from '@/common/decorators/auth-uuid.decorator';

import { AgentService } from '@/common/services/agent/agent.service';
import { FingerprintService } from '@/common/services/fingerprint/fingerprint.service';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly config: ConfigService,
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

    res.cookie(this.config.get('AUTH_COOKIE'), JSON.stringify(session), {
      maxAge: this.config.get('AUTH_COOKIE_EXTEND'),
      httpOnly: true,
      secure: true,
    });

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
    }

    console.log('Sign out session:', session);

    await this.sessionService.remove({
      uuid: session.sessionUuid,
      userUuid: uuid,
      fingerprint,
    });

    res.cookie(this.config.get('AUTH_COOKIE'), null, {
      maxAge: this.config.get('AUTH_COOKIE_EXTEND'),
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({ data: null, meta: {} });
  }
}
