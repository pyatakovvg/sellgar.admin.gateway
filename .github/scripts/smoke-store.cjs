const { Controller, Module } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { MessagePattern, Transport } = require('@nestjs/microservices');

const { AppModule } = require('/app/dist/app.module');
const { StoreProductGateway } = require('/app/dist/api/store_srv/v1/store-product/gateway/store-product.gateway');

class StoreStub {
  getAll() {
    return { data: [], meta: { totalRows: 0 } };
  }
}

Controller()(StoreStub);
MessagePattern({ cmd: 'store.product.getAll' })(
  StoreStub.prototype,
  'getAll',
  Object.getOwnPropertyDescriptor(StoreStub.prototype, 'getAll'),
);

class StoreStubModule {}
Module({ controllers: [StoreStub] })(StoreStubModule);

async function smoke() {
  let server;
  let gateway;
  const timeout = setTimeout(() => {
    console.error('Store gateway RPC smoke timed out');
    process.exit(1);
  }, 15000);

  try {
    server = await NestFactory.createMicroservice(StoreStubModule, {
      logger: false,
      transport: Transport.RMQ,
      options: {
        urls: [{
          hostname: process.env.AMQP_HOSTNAME,
          port: Number(process.env.AMQP_PORT),
          username: process.env.AMQP_USERNAME,
          password: process.env.AMQP_PASSWORD,
        }],
        queue: process.env.AMQP_STORE_SRV_COMMAND_QUEUE,
        queueOptions: { durable: true },
      },
    });
    await server.listen();
    gateway = await NestFactory.createApplicationContext(AppModule, { logger: false });
    const result = await gateway.get(StoreProductGateway).getAll({});
    if (result.meta.totalRows !== 0 || result.data.length !== 0) {
      throw new Error('Unexpected Store response');
    }
    console.log('Store gateway uses the configured broker and validates its RPC response');
  } finally {
    await gateway?.close();
    await server?.close();
    clearTimeout(timeout);
  }
}

smoke().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
