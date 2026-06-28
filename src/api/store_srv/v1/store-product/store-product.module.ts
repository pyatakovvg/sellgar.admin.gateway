import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StoreProductController } from './controller/store-product.controller';
import { StoreProductGateway } from './gateway/store-product.gateway';
import { StoreProductService } from './service/store-product.service';

@Module({
  controllers: [StoreProductController],
  providers: [ConfigService, StoreProductGateway, StoreProductService],
})
export class StoreProductModule {}
