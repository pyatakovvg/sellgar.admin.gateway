import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { StoreProductController } from './store-product.controller';
import { StoreProductService } from '../service/store-product.service';

describe('Store query HTTP contract', () => {
  let app: INestApplication;
  const getAll = jest.fn((query) => query);
  const getByUuid = jest.fn((_uuid, query) => query);
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [StoreProductController],
      providers: [{ provide: StoreProductService, useValue: { getAll, getByUuid } }],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });
  afterAll(async () => app.close());
  it('reads plain query parameters as typed booleans and numeric bounds', async () => {
    const url =
      '/v2/store/products?search=BLUE-S&productShowing=false&variantShowing=true&productStatus=disabled&variantStatus=archived&quantityMin=0&quantityMax=10&reservedMin=0&reservedMax=5&availableMin=0&availableMax=0';
    const result = await request(app.getHttpServer()).get(url).expect(200);
    expect(result.body).toMatchObject({
      search: 'BLUE-S',
      productShowing: false,
      variantShowing: true,
      productStatus: 'disabled',
      variantStatus: 'archived',
      quantityMin: 0,
      quantityMax: 10,
      reservedMin: 0,
      reservedMax: 5,
      availableMin: 0,
      availableMax: 0,
    });
  });
  it('passes the same filters to the detail read', async () => {
    const uuid = '3012a751-2bbc-4300-a8f3-8dc744f7daf7';
    await request(app.getHttpServer())
      .get(`/v2/store/products/${uuid}?variantShowing=false&availableMax=0`)
      .expect(200);
    expect(getByUuid).toHaveBeenCalledWith(uuid, expect.objectContaining({ variantShowing: false, availableMax: 0 }));
  });
  it.each([
    'productShowing=garbage',
    'variantShowing=0',
    'availableMin=',
    'quantityMin=-1',
    'reservedMax=1.5',
    'availableMin=10&availableMax=0',
    'productStatus=draft',
  ])('rejects invalid query: %s', async (query) => {
    await request(app.getHttpServer()).get(`/v2/store/products?${query}`).expect(400);
  });
});
