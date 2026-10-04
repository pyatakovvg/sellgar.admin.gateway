import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ImageUploadService } from './application/image-upload.service';

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
            urls: [{
              port: config.getOrThrow<number>('AMQP_PORT'),
              hostname: config.getOrThrow<string>('AMQP_HOSTNAME'),
              username: config.getOrThrow<string>('AMQP_USERNAME'),
              password: config.getOrThrow<string>('AMQP_PASSWORD'),
            }],
            persistent: true,
            queue: config.getOrThrow<string>('AMQP_FILE_SRV_COMMAND_QUEUE'),
            queueOptions: { durable: true },
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
            urls: [{
              port: config.getOrThrow<number>('AMQP_PORT'),
              hostname: config.getOrThrow<string>('AMQP_HOSTNAME'),
              username: config.getOrThrow<string>('AMQP_USERNAME'),
              password: config.getOrThrow<string>('AMQP_PASSWORD'),
            }],
            persistent: true,
            queue: config.getOrThrow<string>('AMQP_MEDIA_SRV_COMMAND_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  providers: [ImageUploadService],
  exports: [ImageUploadService],
})
export class ImageUploadModule {}
