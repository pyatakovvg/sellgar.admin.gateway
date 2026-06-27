import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NotificationController } from './controller/notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [ConfigService],
})
export class NotificationModule {}
