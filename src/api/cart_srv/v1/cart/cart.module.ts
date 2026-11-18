import { Module } from '@nestjs/common';

import { CartService } from './application/cart.service';
import { CartController } from './presentation/cart.controller';

@Module({ controllers: [CartController], providers: [CartService] })
export class CartModule {}
