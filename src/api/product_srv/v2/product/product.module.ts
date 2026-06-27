import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ProductController } from './controller/product.controller';
import { ProductService } from './service/product.service';
import { ProductGateway } from './gateway/product.gateway';

@Module({
  imports: [
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: 'FILE_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              {
                port: config.get('AMQP_PORT'),
                hostname: config.get('AMQP_HOSTNAME'),
                username: config.get('AMQP_USERNAME'),
                password: config.get('AMQP_PASSWORD'),
              },
            ],
            persistent: true,
            queue: config.get('AMQP_FILE_SRV_COMMAND_QUEUE'),
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
      {
        name: 'MEDIA_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              {
                port: config.get('AMQP_PORT'),
                hostname: config.get('AMQP_HOSTNAME'),
                username: config.get('AMQP_USERNAME'),
                password: config.get('AMQP_PASSWORD'),
              },
            ],
            persistent: true,
            queue: config.get('AMQP_MEDIA_SRV_COMMAND_QUEUE'),
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ConfigService, ProductService, ProductGateway],
})
export class ProductModule {}
