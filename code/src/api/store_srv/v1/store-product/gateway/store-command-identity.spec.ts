import { describe, expect, it, jest } from '@jest/globals';
import { ClientProxy } from '@nestjs/microservices';
import { throwError } from 'rxjs';

import { StoreProductGateway } from './store-product.gateway';
import { CategoryGateway } from '../../category/gateway/category.gateway';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('Store internal command identity', () => {
  it.each(['create', 'update', 'archive', 'receiptInventory', 'writeOffInventory', 'adjustInventory'] as const)(
    'generates the internal identity for %s without requiring it in the public input',
    async (method) => {
      const failure = new Error('Stop after capturing the outgoing command');
      const send = jest.fn((_pattern: unknown, _payload: unknown) => throwError(() => failure));
      const gateway = new StoreProductGateway({ send } as unknown as ClientProxy);
      const input = { commandId: 'untrusted-browser-value', quantity: 1 };

      await expect(gateway[method](input as never)).rejects.toBe(failure);
      const payload = send.mock.calls[0]![1] as { commandId: string; quantity: number };
      expect(payload.commandId).toMatch(uuidPattern);
      expect(payload.quantity).toBe(1);
    },
  );

  it.each(['create', 'update'] as const)('generates the internal identity for category %s', async (method) => {
    const failure = new Error('Stop after capturing the outgoing command');
    const send = jest.fn((_pattern: unknown, _payload: unknown) => throwError(() => failure));
    const gateway = new CategoryGateway({ send } as unknown as ClientProxy);
    const input = { commandId: 'untrusted-browser-value', name: 'Category' };

    if (method === 'create') await expect(gateway.create(input as never)).rejects.toBe(failure);
    else await expect(gateway.update('category-uuid', input as never)).rejects.toBe(failure);
    const payload = send.mock.calls[0]![1] as { commandId: string; name: string };
    expect(payload.commandId).toMatch(uuidPattern);
    expect(payload.name).toBe('Category');
  });
});
