import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { ApiProductV2Module } from '@/api/product_srv/v2/api.module';
import { ApiShopV1Module } from '@/api/shop_srv/v1/api.module';
import { ApiFileV1Module } from '@/api/file_srv/v1/api.module';

import { IdentitySrvModule } from '@/api/identity_srv/identity-srv.module';

@Module({
  imports: [
    IdentitySrvModule,
    ApiProductV2Module,
    ApiShopV1Module,
    ApiFileV1Module,

    HttpModule.register({
      global: true,
    }),
    ConfigModule.forRoot({
      envFilePath: ['gateways/admin/.env', './.env'],
      cache: true,
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
