import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';

import { AllExceptionsFilter } from './common/exceptions/all-exception.filter';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger();

  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const origins = config
    .getOrThrow<string>('ORIGINS')
    .split(';')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: origins,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      wildcards: true,
      persistent: true,
      prefetchCount: 1,
      urls: [
        {
          port: config.getOrThrow<number>('AMQP_PORT'),
          hostname: config.getOrThrow<string>('AMQP_HOSTNAME'),
          username: config.getOrThrow<string>('AMQP_USERNAME'),
          password: config.getOrThrow<string>('AMQP_PASSWORD'),
        },
      ],
      queue: config.getOrThrow<string>('AMQP_ADMIN_GATEWAY_PRODUCT_SRV_EVENT_QUEUE'),
      queueOptions: {
        durable: true,
      },
      exchange: config.getOrThrow<string>('AMQP_PRODUCT_SRV_EXCHANGE'),
      exchangeType: 'topic',
    },
  });

  const port = config.getOrThrow<number>('PORT');

  await app.startAllMicroservices();
  await app.listen(port, () => {
    logger.log('Service has been started on port ' + port);
  });
}

(async () => {
  await bootstrap();
})();
