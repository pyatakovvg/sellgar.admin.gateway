import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { CartServiceClient } from './cart-service.client';
import { CART_COMMAND_SERVICE } from './cart-service.constants';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: CART_COMMAND_SERVICE,
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
              queue: config.getOrThrow<string>('AMQP_CART_SRV_COMMAND_QUEUE'),
              queueOptions: { durable: true },
            },
          }),
        },
      ],
    }),
  ],
  providers: [CartServiceClient],
  exports: [CartServiceClient],
})
export class CartServiceClientModule {}
