import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UnitService } from './service/unit.service';
import { UnitController } from './controller/unit.controller';

@Module({
  controllers: [UnitController],
  providers: [ConfigService, UnitService],
})
export class UnitModule {}
