import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ShopController } from './controller/shop.controller';
import { ShopService } from './service/shop.service';
import { ShopGateway } from './gateway/shop.gateway';

@Module({
  controllers: [ShopController],
  providers: [ConfigService, ShopService, ShopGateway],
})
export class ShopModule {}
