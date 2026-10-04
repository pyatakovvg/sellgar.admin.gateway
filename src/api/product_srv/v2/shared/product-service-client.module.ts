import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ProductServiceClient } from './product-service.client';
import { PRODUCT_COMMAND_SERVICE } from './product-service.constants';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: PRODUCT_COMMAND_SERVICE,
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
              queue: config.getOrThrow<string>('AMQP_PRODUCT_SRV_COMMAND_QUEUE'),
              queueOptions: { durable: true },
            },
          }),
        },
      ],
    }),
  ],
  providers: [ProductServiceClient],
  exports: [ProductServiceClient, ClientsModule],
})
export class ProductServiceClientModule {}
