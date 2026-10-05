import { Module } from '@nestjs/common';

import { ShopServiceClientModule } from './shared/shop-service-client.module';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [ShopServiceClientModule, ShopModule],
})
export class ApiShopV1Module {}
