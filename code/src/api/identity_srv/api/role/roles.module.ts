import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesGateway } from './roles.gateway';

@Module({
  providers: [ConfigService, RolesService, RolesGateway],
  controllers: [RolesController],
})
export class RolesModule {}
