import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { RealtimeController } from './controller/realtime.controller';
import { REALTIME_EVENT_SERVICE } from './realtime.constants';
import { RealtimePublisherService } from './service/realtime-publisher.service';

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: REALTIME_EVENT_SERVICE,
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
              wildcards: true,
              persistent: true,
              queue: '',
              queueOptions: {
                durable: false,
                autoDelete: true,
              },
              exchange: config.get<string>('AMQP_EVENTS_EXCHANGE', 'event.exchange'),
              exchangeType: 'topic',
            },
          }),
        },
      ],
    }),
  ],
  controllers: [RealtimeController],
  providers: [RealtimePublisherService],
})
export class RealtimeModule {}
