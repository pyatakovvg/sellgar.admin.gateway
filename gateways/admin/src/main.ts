import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';

import { AllExceptionsFilter } from './common/exceptions/all-exception.filter';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger();
  const config = new ConfigService();

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: config.get<string>('ORIGINS').split(';') as string[],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      wildcards: true,
      persistent: true,
      prefetchCount: 1,
      queue: config.get('AMQP_ADMIN_SRV_EVENT_QUEUE'),
      queueOptions: {
        durable: true,
      },
      exchange: config.get('AMQP_EVENTS_EXCHANGE'),
      exchangeType: 'topic',
    },
  });

  const port: number = config.get<number>('PORT');

  await app.startAllMicroservices();
  await app.listen(port, () => {
    logger.log('Service has been started on port ' + port);
  });
}

(async () => {
  await bootstrap();
})();
