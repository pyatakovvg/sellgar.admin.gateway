import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { PriceService } from './service/price.service';
import { PriceGateway } from './gateway/price.gateway';

@Module({
  imports: [HttpModule],
  providers: [ConfigService, PriceService, PriceGateway],
  exports: [PriceService],
})
export class PriceModule {}
