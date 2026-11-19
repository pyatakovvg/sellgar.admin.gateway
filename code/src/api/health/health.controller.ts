import { Controller, Get } from '@nestjs/common';

import { Public } from '../identity_srv/helpers/session-auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'sellgar.admin.gateway',
    };
  }
}
