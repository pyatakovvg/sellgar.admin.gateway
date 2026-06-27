import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ProductController } from './controller/product.controller';
import { ProductService } from './service/product.service';
import { ProductGateway } from './gateway/product.gateway';

@Module({
  controllers: [ProductController],
  providers: [ConfigService, ProductService, ProductGateway],
})
export class ProductModule {}
