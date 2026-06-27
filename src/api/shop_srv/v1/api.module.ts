import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ShopModule } from './shop/shop.module';

@Module({
  imports: [
    ShopModule,

    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: 'SHOP_COMMAND_SERVICE',
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
                queue: config.get('AMQP_SHOP_SRV_COMMAND_QUEUE'),
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
export class ApiShopV1Module {}
