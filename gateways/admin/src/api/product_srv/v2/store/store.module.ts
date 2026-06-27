import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StoreController } from './controller/store.controller';
import { StoreService } from './service/store.service';
import { StoreGateway } from './gateway/store.gateway';

import { PriceModule } from '../price/price.module';

@Module({
  controllers: [StoreController],
  providers: [ConfigService, StoreService, StoreGateway],
  imports: [PriceModule],
})
export class StoreModule {}
