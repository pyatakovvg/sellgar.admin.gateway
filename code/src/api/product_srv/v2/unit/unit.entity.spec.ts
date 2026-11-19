import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateUnitDto } from './presentation/dto/create-unit.dto';
import { UpdateUnitDto } from './presentation/dto/update-unit.dto';
import { UnitEntity } from './unit.entity';

describe('Unit description contract', () => {
  it.each([undefined, null, '', 'Описание\nВторая строка'])(
    'accepts an optional description in commands: %j',
    async (description) => {
      const create = plainToInstance(CreateUnitDto, { code: 'cm', name: 'Сантиметр', symbol: 'см', description });
      const update = plainToInstance(UpdateUnitDto, { version: 1, description });
      expect(await validate(create)).toHaveLength(0);
      expect(await validate(update)).toHaveLength(0);
      expect(create.description).toBe(description);
      expect(update.description).toBe(description);
    },
  );

  it('rejects a non-string description in both commands', async () => {
    const create = plainToInstance(CreateUnitDto, { code: 'cm', name: 'Сантиметр', symbol: 'см', description: 123 });
    const update = plainToInstance(UpdateUnitDto, { version: 1, description: 123 });
    expect((await validate(create)).map((error) => error.property)).toContain('description');
    expect((await validate(update)).map((error) => error.property)).toContain('description');
  });

  it('exposes a multiline description in the service response', async () => {
    const unit = plainToInstance(
      UnitEntity,
      {
        code: 'cm',
        name: 'Сантиметр',
        symbol: 'см',
        description: 'Первая строка\nВторая строка',
        version: 1,
        createdAt: '2026-10-12T00:00:00.000Z',
        updatedAt: '2026-10-12T00:00:00.000Z',
      },
      { excludeExtraneousValues: true },
    );
    expect(await validate(unit)).toHaveLength(0);
    expect(unit.description).toBe('Первая строка\nВторая строка');
  });
});
