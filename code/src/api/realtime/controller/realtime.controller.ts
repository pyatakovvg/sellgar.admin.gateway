import { CategoryEntity } from '@/api/store_srv/v1/category/entity/category.entity';
import { CategoryChangedEventDto } from '../dto/category-changed-event.dto';
import { CATEGORY_CREATED_PATTERN, CATEGORY_UPDATED_PATTERN } from '../realtime.constants';
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { ProductEntity } from '@/api/product_srv/v2/product/product.entity';
import { StoreProductEntity as RawStoreProductEntity } from '@/api/store_srv/v1/store-product/entity';

import { ProductUpdatedEventDto } from '../dto/product-updated-event.dto';
import { StoreProductChangedEventDto } from '../dto/store-product-changed-event.dto';
import {
  PRODUCT_UPDATED_PATTERN,
  STORE_PRODUCT_CREATED_PATTERN,
  STORE_PRODUCT_UPDATED_PATTERN,
} from '../realtime.constants';
import { RealtimePublisherService } from '../service/realtime-publisher.service';

class InvalidRealtimeEventError extends Error {}

@Controller()
export class RealtimeController {
  private readonly logger = new Logger(RealtimeController.name);

  constructor(private readonly publisher: RealtimePublisherService) {}

  @EventPattern<string>(PRODUCT_UPDATED_PATTERN)
  async productUpdated(@Payload() payload: unknown, @Ctx() context: RmqContext): Promise<void> {
    await this.consume(context, async () => {
      const event = plainToInstance(ProductUpdatedEventDto, payload);
      await this.validateInput(event);

      const product = plainToInstance(ProductEntity, event.payload, { excludeExtraneousValues: true });
      await this.validateInput(product);

      await this.publisher.publish({
        eventUuid: event.eventUuid,
        eventType: event.eventType,
        schemaVersion: event.schemaVersion,
        occurredAt: event.occurredAt,
        channel: 'products',
        payload: instanceToPlain(product) as Record<string, unknown>,
      });
    });
  }

  @EventPattern([STORE_PRODUCT_CREATED_PATTERN, STORE_PRODUCT_UPDATED_PATTERN])
  async storeProductChanged(@Payload() payload: unknown, @Ctx() context: RmqContext): Promise<void> {
    await this.consume(context, async () => {
      const event = plainToInstance(StoreProductChangedEventDto, payload);
      await this.validateInput(event);

      const rawStoreProduct = plainToInstance(RawStoreProductEntity, event.payload, {
        excludeExtraneousValues: true,
      });
      await this.validateInput(rawStoreProduct);

      await this.publisher.publish({
        eventUuid: event.eventUuid,
        eventType: event.eventType,
        schemaVersion: event.schemaVersion,
        occurredAt: event.occurredAt,
        channel: 'offers',
        payload: instanceToPlain(rawStoreProduct) as Record<string, unknown>,
      });
    });
  }

  @EventPattern<string>(CATEGORY_CREATED_PATTERN)
  async categoryCreated(@Payload() payload: unknown, @Ctx() context: RmqContext): Promise<void> {
    await this.categoryChanged(payload, context);
  }

  @EventPattern<string>(CATEGORY_UPDATED_PATTERN)
  async categoryUpdated(@Payload() payload: unknown, @Ctx() context: RmqContext): Promise<void> {
    await this.categoryChanged(payload, context);
  }

  private async categoryChanged(payload: unknown, context: RmqContext): Promise<void> {
    await this.consume(context, async () => {
      const event = plainToInstance(CategoryChangedEventDto, payload);
      await this.validateInput(event);
      const category = plainToInstance(CategoryEntity, event.payload, { excludeExtraneousValues: true });
      await this.validateInput(category);
      await this.publisher.publish({
        eventUuid: event.eventUuid,
        eventType: event.eventType,
        schemaVersion: event.schemaVersion,
        occurredAt: event.occurredAt,
        channel: 'categories',
        payload: instanceToPlain(category) as Record<string, unknown>,
      });
    });
  }

  private async consume(context: RmqContext, operation: () => Promise<void>): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await operation();
      channel.ack(message);
    } catch (error) {
      const invalid = error instanceof InvalidRealtimeEventError;

      this.logger.error(
        invalid ? 'Rejected invalid domain event' : 'Failed to normalize realtime event',
        error instanceof Error ? error.stack : undefined,
      );
      channel.nack(message, false, !invalid);
    }
  }

  private async validateInput(value: object): Promise<void> {
    try {
      await validateOrReject(value, { forbidNonWhitelisted: true, whitelist: true });
    } catch {
      throw new InvalidRealtimeEventError();
    }
  }
}
