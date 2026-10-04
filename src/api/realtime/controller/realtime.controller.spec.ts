/// <reference types="jest" />

import { RmqContext } from '@nestjs/microservices';

import { RealtimePublisherService } from '../service/realtime-publisher.service';
import { RealtimeController } from './realtime.controller';

describe(RealtimeController.name, () => {
  it('publishes a validated product entity and acknowledges the domain event', async () => {
    const publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    const { channel, context, message } = createRmqContext();
    const controller = new RealtimeController(publisher as unknown as RealtimePublisherService);

    await controller.productUpdated(
      createEnvelope('product.updated', 'product', createProductPayload(), 2),
      context,
    );

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'products',
        eventType: 'product.updated',
        eventUuid: '5a943eb6-4d4f-4c11-9962-08cf45e1697e',
        payload: expect.objectContaining({
          name: 'Product',
          uuid: '3a4752e0-c56d-4d72-8976-28438f680fb8',
          version: 7,
        }),
      }),
    );
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('publishes the Store-owned read model without querying Product service', async () => {
    const publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    const { channel, context, message } = createRmqContext();
    const controller = new RealtimeController(publisher as unknown as RealtimePublisherService);

    await controller.storeProductUpdated(
      createEnvelope('store.product.updated', 'store_product', createRawStoreProductPayload()),
      context,
    );

    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'offers',
        eventType: 'store.product.updated',
        payload: expect.objectContaining({
          productUuid: '39782b12-1077-4b75-94d2-c783e2ce8817',
          shopUuid: '1d932a09-5015-4688-a50e-03822fdeb37c',
          uuid: '5b7e713c-f6c6-4450-b1dc-767a7458bf55',
        }),
      }),
    );
    expect(channel.ack).toHaveBeenCalledWith(message);
  });

  it('requeues a valid event when normalized delivery publishing fails', async () => {
    const publisher = { publish: jest.fn().mockRejectedValue(new Error('publish failed')) };
    const { channel, context, message } = createRmqContext();
    const controller = new RealtimeController(publisher as unknown as RealtimePublisherService);

    await controller.productUpdated(
      createEnvelope('product.updated', 'product', createProductPayload(), 2),
      context,
    );

    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, true);
  });

  it('rejects an invalid domain event without requeueing it', async () => {
    const publisher = { publish: jest.fn() };
    const { channel, context, message } = createRmqContext();
    const controller = new RealtimeController(publisher as unknown as RealtimePublisherService);

    await controller.productUpdated({ eventType: 'product.updated' }, context);

    expect(publisher.publish).not.toHaveBeenCalled();
    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).toHaveBeenCalledWith(message, false, false);
  });
});

const createRmqContext = () => {
  const channel = { ack: jest.fn(), nack: jest.fn() };
  const message = { fields: { deliveryTag: 42 } };
  const context = {
    getChannelRef: () => channel,
    getMessage: () => message,
  } as unknown as RmqContext;

  return { channel, context, message };
};

const createEnvelope = (
  eventType: 'product.updated' | 'store.product.updated',
  aggregateType: 'product' | 'store_product',
  payload: Record<string, unknown>,
  schemaVersion = 1,
) => ({
  aggregateType,
  ...(aggregateType === 'product'
    ? { aggregateId: '3a4752e0-c56d-4d72-8976-28438f680fb8' }
    : { aggregateUuid: '5b7e713c-f6c6-4450-b1dc-767a7458bf55' }),
  aggregateVersion: aggregateType === 'product' ? 7 : 8,
  eventType,
  eventUuid: '5a943eb6-4d4f-4c11-9962-08cf45e1697e',
  occurredAt: '2026-08-08T12:00:00.000Z',
  payload,
  producer: aggregateType === 'product' ? 'product_srv' : 'store_srv',
  schemaVersion,
});

const createProductPayload = () => ({
  brandCode: 'brand',
  uuid: '3a4752e0-c56d-4d72-8976-28438f680fb8',
  createdAt: '2026-08-08T12:00:00.000Z',
  description: 'Product description',
  name: 'Product',
  properties: [],
  status: 'active',
  typeUuid: 'f334ff3d-e8f7-4080-b8f0-35e66c4d876e',
  typeVersion: 3,
  updatedAt: '2026-08-08T12:00:00.000Z',
  variants: [],
  version: 7,
});

const createRawStoreProductPayload = () => ({
  article: 'STORE-PRODUCT',
  createdAt: '2026-08-08T12:00:00.000Z',
  offers: [],
  productUuid: '39782b12-1077-4b75-94d2-c783e2ce8817',
  shopUuid: '1d932a09-5015-4688-a50e-03822fdeb37c',
  showing: true,
  status: 'active',
  updatedAt: '2026-08-08T12:00:00.000Z',
  uuid: '5b7e713c-f6c6-4450-b1dc-767a7458bf55',
  version: 8,
});
