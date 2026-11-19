import { Module } from '@nestjs/common';

import { ImageUploadModule } from '../shared/image-upload.module';
import { BrandService } from './application/brand.service';
import { BrandController } from './presentation/brand.controller';

@Module({
  imports: [ImageUploadModule],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
