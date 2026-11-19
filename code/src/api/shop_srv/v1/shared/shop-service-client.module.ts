import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ShopServiceClient } from './shop-service.client';
import { SHOP_COMMAND_SERVICE } from './shop-service.constants';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: SHOP_COMMAND_SERVICE,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
              urls: [
                {
                  port: config.getOrThrow<number>('AMQP_PORT'),
                  hostname: config.getOrThrow<string>('AMQP_HOSTNAME'),
                  username: config.getOrThrow<string>('AMQP_USERNAME'),
                  password: config.getOrThrow<string>('AMQP_PASSWORD'),
                },
              ],
              persistent: true,
              prefetchCount: 1,
              queue: config.getOrThrow<string>('AMQP_SHOP_SRV_COMMAND_QUEUE'),
              queueOptions: { durable: true },
            },
          }),
        },
      ],
    }),
  ],
  providers: [ShopServiceClient],
  exports: [ShopServiceClient, ClientsModule],
})
export class ShopServiceClientModule {}
