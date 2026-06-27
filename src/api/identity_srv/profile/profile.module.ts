import { Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';

import { ProfileController } from './controller/profile.controller';
import { ProfileService } from './service/profile.service';
import { ProfileGateway } from './gateway/profile.gateway';

@Module({
  imports: [UserModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileGateway],
})
export class ProfileModule {}
