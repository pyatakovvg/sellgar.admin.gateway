import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PropertyService } from './service/property.service';
import { PropertyController } from './controller/property.controller';

@Module({
  controllers: [PropertyController],
  providers: [ConfigService, PropertyService],
})
export class PropertyModule {}
