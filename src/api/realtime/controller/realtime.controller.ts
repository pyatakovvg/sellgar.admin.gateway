import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { ProductEntity } from '@/api/product_srv/v2/product/product.entity';
import { StoreProductEntity as RawStoreProductEntity } from '@/api/store_srv/v1/store-product/entity';

import { ProductUpdatedEventDto } from '../dto/product-updated-event.dto';
import { StoreProductUpdatedEventDto } from '../dto/store-product-updated-event.dto';
import { PRODUCT_UPDATED_PATTERN, STORE_PRODUCT_UPDATED_PATTERN } from '../realtime.constants';
import { RealtimePublisherService } from '../service/realtime-publisher.service';

class InvalidRealtimeEventError extends Error {}

@Controller()
export class RealtimeController {
  private readonly logger = new Logger(RealtimeController.name);

  constructor(private readonly publisher: RealtimePublisherService) {}

  @EventPattern(PRODUCT_UPDATED_PATTERN)
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

  @EventPattern(STORE_PRODUCT_UPDATED_PATTERN)
  async storeProductUpdated(@Payload() payload: unknown, @Ctx() context: RmqContext): Promise<void> {
    await this.consume(context, async () => {
      const event = plainToInstance(StoreProductUpdatedEventDto, payload);
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
