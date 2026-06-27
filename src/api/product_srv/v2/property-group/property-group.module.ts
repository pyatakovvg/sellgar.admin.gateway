import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PropertyGroupService } from './service/property-group.service';
import { PropertyGroupController } from './controller/property-group.controller';

@Module({
  controllers: [PropertyGroupController],
  providers: [ConfigService, PropertyGroupService],
})
export class PropertyGroupModule {}
