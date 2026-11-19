import { Module } from '@nestjs/common';

import { ProductTypeService } from './application/product-type.service';
import { ProductTypeController } from './presentation/product-type.controller';

@Module({
  controllers: [ProductTypeController],
  providers: [ProductTypeService],
})
export class ProductTypeModule {}
