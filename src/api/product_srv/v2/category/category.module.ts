import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CategoryService } from './service/category.service';
import { CategoryController } from './controller/category.controller';

@Module({
  controllers: [CategoryController],
  providers: [ConfigService, CategoryService],
})
export class CategoryModule {}
