import { Module } from '@nestjs/common';

import { CartModule } from './cart/cart.module';
import { CartServiceClientModule } from './shared/cart-service-client.module';

@Module({ imports: [CartServiceClientModule, CartModule] })
export class ApiCartV1Module {}
