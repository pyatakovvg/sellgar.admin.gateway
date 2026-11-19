import { Module } from '@nestjs/common';

import { CategoryController } from './controller/category.controller';
import { CategoryGateway } from './gateway/category.gateway';

@Module({ controllers: [CategoryController], providers: [CategoryGateway] })
export class CategoryModule {}
