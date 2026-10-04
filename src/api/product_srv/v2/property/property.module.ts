import { Module } from '@nestjs/common';

import { PropertyService } from './application/property.service';
import { PropertyController } from './presentation/property.controller';

@Module({
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
