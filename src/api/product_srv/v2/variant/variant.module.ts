import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { VariantController } from './controller/variant.controller';
import { VariantService } from './service/variant.service';
import { VariantGateway } from './gateway/variant.gateway';

@Module({
  imports: [HttpModule],
  providers: [ConfigService, VariantService, VariantGateway],
  controllers: [VariantController],
})
export class VariantModule {}
