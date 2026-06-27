import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { PermissionGateway } from './permission.gateway';

@Module({
  providers: [ConfigService, PermissionService, PermissionGateway],
  controllers: [PermissionController],
})
export class PermissionModule {}
