import { Controller, Get } from '@nestjs/common';

import { AuthUuid } from '@/common/decorators/auth-uuid.decorator';

import { ProfileService } from '../service/profile.service';

@Controller('v1/auth')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/profile')
  async get(@AuthUuid() userUuid: string) {
    return this.profileService.getByUserUuid(userUuid);
  }
}
