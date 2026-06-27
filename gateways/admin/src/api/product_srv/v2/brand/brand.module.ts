import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BrandController } from './controller/brand.controller';

import { BrandService } from './service/brand.service';

@Module({
  controllers: [BrandController],
  providers: [ConfigService, BrandService],
})
export class BrandModule {}
