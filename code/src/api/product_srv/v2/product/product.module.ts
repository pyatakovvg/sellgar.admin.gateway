import { Module } from '@nestjs/common';

import { ImageUploadModule } from '../shared/image-upload.module';
import { ProductService } from './application/product.service';
import { ProductController } from './presentation/product.controller';

@Module({
  imports: [ImageUploadModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
