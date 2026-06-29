import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { BrandController } from './controller/brand.controller';

import { BrandService } from './service/brand.service';

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
  controllers: [BrandController],
  providers: [ConfigService, BrandService],
})
export class BrandModule {}
