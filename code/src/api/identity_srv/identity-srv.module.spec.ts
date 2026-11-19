import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

import { IdentitySrvModule } from './identity-srv.module';

describe('Identity command connection configuration', () => {
  it('passes the configured RabbitMQ address and credentials into the client options', async () => {
    const modules = Reflect.getMetadata('imports', IdentitySrvModule);
    const provider = modules
      .flatMap((module: { providers?: unknown[] }) => module.providers ?? [])
      .find((entry: { provide?: string }) => entry.provide === 'IDENTITY_SERVICE') as FactoryProvider<ClientProxy>;
    const config = new ConfigService({
      AMQP_HOSTNAME: 'configured-broker',
      AMQP_PORT: 5673,
      AMQP_USERNAME: 'test-user',
      AMQP_PASSWORD: 'test-password',
      AMQP_IDENTITY_SRV_COMMAND_QUEUE: 'configured-identity-queue',
    });
    const client = await provider.useFactory(config);

    try {
      const { options } = client as unknown as { options: { urls: unknown[]; queue: string } };
      expect(options.urls).toEqual([
        { hostname: 'configured-broker', port: 5673, username: 'test-user', password: 'test-password' },
      ]);
      expect(options.queue).toBe('configured-identity-queue');
    } finally {
      await client.close();
    }
  });
});
