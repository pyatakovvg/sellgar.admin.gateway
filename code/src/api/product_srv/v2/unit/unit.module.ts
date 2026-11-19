import { Module } from '@nestjs/common';

import { UnitService } from './application/unit.service';
import { UnitController } from './presentation/unit.controller';

@Module({
  controllers: [UnitController],
  providers: [UnitService],
})
export class UnitModule {}
