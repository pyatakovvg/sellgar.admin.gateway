import { Module } from '@nestjs/common';

import { UnitModule } from './unit/unit.module';
import { BrandModule } from './brand/brand.module';
import { ProductModule } from './product/product.module';
import { ProductTypeModule } from './product-type/product-type.module';
import { PropertyModule } from './property/property.module';
import { ProductServiceClientModule } from './shared/product-service-client.module';

@Module({
  imports: [
    ProductServiceClientModule,
    ProductModule,
    ProductTypeModule,
    PropertyModule,
    UnitModule,
    BrandModule,
  ],
})
export class ApiProductV2Module {}
