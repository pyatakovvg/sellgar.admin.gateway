import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ShopModule } from './shop/shop.module';
import { UnitModule } from './unit/unit.module';
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';
import { StoreModule } from './store/store.module';
import { ProductModule } from './product/product.module';
import { PriceModule } from './price/price.module';
import { PropertyModule } from './property/property.module';
import { CurrencyModule } from './currency/currency.module';
import { VariantModule } from './variant/variant.module';
import { PropertyGroupModule } from './property-group/property-group.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ShopModule,
    ProductModule,
    VariantModule,
    PriceModule,
    StoreModule,
    PropertyGroupModule,
    PropertyModule,
    UnitModule,
    BrandModule,
    CategoryModule,
    CurrencyModule,
    NotificationModule,

    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: 'PRODUCT_COMMAND_SERVICE',
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            return {
              urls: [
                {
                  port: config.get('AMQP_PORT'),
                  hostname: config.get('AMQP_HOSTNAME'),
                  username: config.get('AMQP_USERNAME'),
                  password: config.get('AMQP_PASSWORD'),
                },
              ],
              transport: Transport.RMQ,
              options: {
                persistent: true,
                prefetchCount: 1,
                queue: config.get('AMQP_PRODUCT_SRV_COMMAND_QUEUE'),
                queueOptions: {
                  durable: true,
                },
              },
            };
          },
        },
      ],
    }),
  ],
})
export class ApiProductV2Module {}
