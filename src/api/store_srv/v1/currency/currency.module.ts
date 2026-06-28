import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CurrencyController } from './controller/currency.controller';
import { CurrencyGateway } from './gateway/currency.gateway';
import { CurrencyService } from './service/currency.service';

@Module({
  controllers: [CurrencyController],
  providers: [ConfigService, CurrencyService, CurrencyGateway],
})
export class CurrencyModule {}
