import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CurrencyController } from './controller/currency.controller';
import { CurrencyService } from './service/currency.service';
import { CurrencyGateway } from './gateway/currency.gateway';

@Module({
  controllers: [CurrencyController],
  providers: [ConfigService, CurrencyService, CurrencyGateway],
})
export class CurrencyModule {}
