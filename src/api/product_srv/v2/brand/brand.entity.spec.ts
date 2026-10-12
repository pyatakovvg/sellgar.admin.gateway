import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { BrandEntity } from './brand.entity';

describe('Brand image response', () => {
  it('exposes the linked image file name in the admin contract', async () => {
    const brand = plainToInstance(
      BrandEntity,
      {
        code: 'brand',
        name: 'Brand',
        description: null,
        version: 2,
        createdAt: '2026-10-11T08:00:00.000Z',
        updatedAt: '2026-10-11T08:00:00.000Z',
        images: [
          {
            brandCode: 'brand',
            imageUuid: '11111111-1111-4111-8111-111111111111',
            sortOrder: 0,
            image: { fileName: 'brand.png', version: 1 },
          },
        ],
      },
      { excludeExtraneousValues: true },
    );

    await validateOrReject(brand);

    expect(brand.images[0].fileName).toBe('brand.png');
    expect(brand.images[0]).not.toHaveProperty('image');
  });
});
