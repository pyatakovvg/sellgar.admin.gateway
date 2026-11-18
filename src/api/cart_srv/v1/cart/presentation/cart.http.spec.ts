import { randomUUID } from 'node:crypto';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import request from 'supertest';

import { SessionService } from '@/api/identity_srv/api/session/service/session.service';
import { AuthSessionContextService } from '@/api/identity_srv/helpers/session-auth/context/auth-session-context.service';
import { AuthCookieService } from '@/api/identity_srv/helpers/session-auth/cookie/auth-cookie.service';
import { SessionAuthGuard } from '@/api/identity_srv/helpers/session-auth/guards/session-auth.guard';
import { AllExceptionsFilter } from '@/common/exceptions/all-exception.filter';
import { ApiCartV1Module } from '../../api.module';
import { CART_COMMAND_SERVICE } from '../../shared/cart-service.constants';

describe('Admin Cart HTTP branch', () => {
  let app: INestApplication;
  const send = jest.fn();
  const uuid = randomUUID(),
    shopUuid = randomUUID(),
    ownerUuid = randomUUID(),
    recordUuid = randomUUID();
  const metadata = {
    uuid,
    ownerUuid,
    version: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    closedAt: null,
  };
  const cart = {
    ...metadata,
    shop: { uuid: shopUuid, name: 'Центр', sourceVersion: 1 },
    items: [
      {
        recordUuid,
        offerUuid: randomUUID(),
        productUuid: randomUUID(),
        variantUuid: randomUUID(),
        productName: 'Кофе',
        variantName: 'Арабика',
        article: 'COFFEE',
        clarifications: ['250 г'],
        imageUuid: null,
        quantity: 1,
        version: '1',
        checkoutUuid: null,
        available: 3,
        price: { uuid: randomUUID(), value: '125.50', currencyCode: 'RUB' },
        subtotal: '125.50',
        reasons: [],
        message: null,
        canCheckout: true,
        canOpenProduct: true,
        canIncrease: true,
        canDecrease: false,
        canRemove: true,
        sourceVersions: { product: 1, store: 1, inventory: 1 },
      },
    ],
    currencyCode: 'RUB',
    itemsTotal: '125.50',
  };
  const page = {
    data: [{ ...metadata, shop: { uuid: shopUuid, name: 'Центр' }, itemsCount: 1 }],
    meta: { totalRows: 1, limit: 50, offset: 0 },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), ApiCartV1Module],
    })
      .overrideProvider(CART_COMMAND_SERVICE)
      .useValue({ send })
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalGuards(
      new SessionAuthGuard(
        new Reflector(),
        {
          verify: jest.fn(async () => ({ data: { status: 'active', userId: randomUUID() }, meta: {} })),
        } as unknown as SessionService,
        {
          read: (req) => (req.headers.cookie === 'admin.sid=test' ? 'test-session' : null),
        } as unknown as AuthCookieService,
        {
          build: () => ({ fingerprint: 'test', clientType: 'web', gateway: 'admin_gw', device: 'test' }),
        } as unknown as AuthSessionContextService,
      ),
    );
    await app.init();
  });

  beforeEach(() => {
    send
      .mockReset()
      .mockImplementation(({ cmd }) =>
        of(
          cmd === 'cart.admin.getAll'
            ? page
            : cmd === 'cart.admin.getByUuid'
              ? cart
              : { cartUuid: uuid, recordUuid, version: '2', quantity: 2 },
        ),
      );
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => app.close());

  it('requires the existing session guard and never calls Cart anonymously', async () => {
    await request(app.getHttpServer()).get('/v1/carts').expect(401);
    expect(send).not.toHaveBeenCalled();
  });

  it('passes typed pagination and owner/shop/status filters and exposes only the list entity', async () => {
    send.mockReturnValue(of({ ...page, secret: 'drop', data: [{ ...page.data[0], internal: 'drop' }] }));
    const result = await request(app.getHttpServer())
      .get(`/v1/carts?shopUuid=${shopUuid}&ownerUuid=${ownerUuid}&status=closed&limit=20&offset=40`)
      .set('Cookie', 'admin.sid=test')
      .expect(200);
    expect(send).toHaveBeenCalledWith(
      { cmd: 'cart.admin.getAll' },
      { shopUuid, ownerUuid, status: 'closed', limit: 20, offset: 40 },
    );
    expect(result.body.secret).toBeUndefined();
    expect(result.body.data[0].internal).toBeUndefined();
    expect(result.body.data[0].ownerUuid).toBe(ownerUuid);
  });

  it('reads the full card with exact money and nullable projection fields', async () => {
    const result = await request(app.getHttpServer())
      .get(`/v1/carts/${uuid}`)
      .set('Cookie', 'admin.sid=test')
      .expect(200);
    const { sourceVersion: _shopVersion, ...shop } = cart.shop;
    const { checkoutUuid: _checkout, sourceVersions: _sources, available, ...item } = cart.items[0];
    expect(result.body).toEqual({ ...cart, shop, items: [{ ...item, availableQuantity: available }] });
    expect(send).toHaveBeenCalledWith({ cmd: 'cart.admin.getByUuid' }, { uuid });
  });

  it('adds only to the route cart and strips a forged owner/shop/cart scope', async () => {
    await request(app.getHttpServer())
      .post(`/v1/carts/${uuid}/items`)
      .set('Cookie', 'admin.sid=test')
      .send({
        recordUuid,
        quantity: 2,
        ownerUuid: randomUUID(),
        shopUuid: randomUUID(),
        cartUuid: randomUUID(),
      })
      .expect(201);
    expect(send).toHaveBeenCalledWith(
      { cmd: 'cart.admin.item.add' },
      { recordUuid, quantity: 2, cartUuid: uuid, idempotencyKey: expect.any(String) },
    );
  });

  it('uses route UUIDs and a decimal string version when setting quantity', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/carts/${uuid}/items/${recordUuid}`)
      .set('Cookie', 'admin.sid=test')
      .send({ version: '9007199254740993', quantity: 2, recordUuid: randomUUID() })
      .expect(200);
    expect(send).toHaveBeenCalledWith(
      { cmd: 'cart.admin.item.setQuantity' },
      {
        expectedItemVersion: '9007199254740993',
        quantity: 2,
        cartUuid: uuid,
        recordUuid,
        idempotencyKey: expect.any(String),
      },
    );
  });

  it('owns internal request keys and treats separate HTTP calls as separate operations', async () => {
    const forgedKey = randomUUID();
    for (let attempt = 0; attempt < 2; attempt++) {
      await request(app.getHttpServer())
        .post(`/v1/carts/${uuid}/items`)
        .set('Cookie', 'admin.sid=test')
        .send({ recordUuid, quantity: 1, idempotencyKey: forgedKey })
        .expect(201);
    }
    const firstKey = send.mock.calls[0][1].idempotencyKey;
    const secondKey = send.mock.calls[1][1].idempotencyKey;
    expect(firstKey).not.toBe(forgedKey);
    expect(secondKey).not.toBe(forgedKey);
    expect(secondKey).not.toBe(firstKey);
  });

  it('removes with idempotency and expected row version', async () => {
    send.mockReturnValue(of({ cartUuid: uuid, recordUuid, version: '3' }));
    const result = await request(app.getHttpServer())
      .delete(`/v1/carts/${uuid}/items/${recordUuid}`)
      .set('Cookie', 'admin.sid=test')
      .send({ version: '2' })
      .expect(200);
    expect(result.body).toEqual({ cartUuid: uuid, recordUuid, cartVersion: '3' });
    expect(send).toHaveBeenCalledWith(
      { cmd: 'cart.admin.item.remove' },
      { expectedItemVersion: '2', cartUuid: uuid, recordUuid, idempotencyKey: expect.any(String) },
    );
  });

  it.each([
    'limit=0',
    'limit=101',
    'offset=-1',
    'offset=1.5',
    'limit=',
    'shopUuid=bad',
    'ownerUuid=bad',
    'status=archived',
  ])('rejects invalid query %s before RMQ', async (query) => {
    await request(app.getHttpServer()).get(`/v1/carts?${query}`).set('Cookie', 'admin.sid=test').expect(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects invalid paths and quantity/version bodies before RMQ', async () => {
    await request(app.getHttpServer()).get('/v1/carts/not-a-uuid').set('Cookie', 'admin.sid=test').expect(400);
    await request(app.getHttpServer())
      .post(`/v1/carts/${uuid}/items`)
      .set('Cookie', 'admin.sid=test')
      .send({ recordUuid, quantity: 0 })
      .expect(400);
    await request(app.getHttpServer())
      .patch(`/v1/carts/${uuid}/items/${recordUuid}`)
      .set('Cookie', 'admin.sid=test')
      .send({ quantity: 1, version: 1 })
      .expect(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects missing records and old version fields before RMQ', async () => {
    await request(app.getHttpServer())
      .post(`/v1/carts/${uuid}/items`)
      .set('Cookie', 'admin.sid=test')
      .send({ commandId: recordUuid, quantity: 1 })
      .expect(400);
    await request(app.getHttpServer())
      .delete(`/v1/carts/${uuid}/items/${recordUuid}`)
      .set('Cookie', 'admin.sid=test')
      .send({ expectedVersion: '1' })
      .expect(400);
    await request(app.getHttpServer())
      .delete(`/v1/carts/${uuid}/items/${recordUuid}`)
      .set('Cookie', 'admin.sid=test')
      .send({ expectedItemVersion: '1' })
      .expect(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('preserves Cart conflicts and missing-card errors as HTTP statuses', async () => {
    send.mockReturnValue(throwError(() => ({ statusCode: 409, message: 'Cart item is being checked out' })));
    await request(app.getHttpServer())
      .delete(`/v1/carts/${uuid}/items/${recordUuid}`)
      .set('Cookie', 'admin.sid=test')
      .send({ version: '1' })
      .expect(409);
    send.mockReturnValue(throwError(() => ({ statusCode: 404, message: 'Cart not found' })));
    await request(app.getHttpServer()).get(`/v1/carts/${uuid}`).set('Cookie', 'admin.sid=test').expect(404);
  });

  it('rejects malformed downstream cards instead of returning partial data', async () => {
    send.mockReturnValue(of({ ...cart, items: [{ ...cart.items[0], price: { value: 'wrong' } }] }));
    await request(app.getHttpServer()).get(`/v1/carts/${uuid}`).set('Cookie', 'admin.sid=test').expect(502);
  });
});
