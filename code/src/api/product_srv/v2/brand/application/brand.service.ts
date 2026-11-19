import { Injectable } from '@nestjs/common';

import { ImageUploadService, UploadedImage } from '../../shared/application/image-upload.service';
import { UploadedFile } from '../../shared/application/uploaded-file';
import { ProductServiceClient } from '../../shared/product-service.client';
import { ProductServiceCommand } from '../../shared/product-service.constants';
import { PaginationQueryDto } from '../../shared/presentation/dto/pagination-query.dto';
import { CreateBrandDto } from '../presentation/dto/create-brand.dto';
import { UpdateBrandDto } from '../presentation/dto/update-brand.dto';
import { BrandEntity, BrandPageEntity } from '../brand.entity';

@Injectable()
export class BrandService {
  constructor(
    private readonly productService: ProductServiceClient,
    private readonly imageUpload: ImageUploadService,
  ) {}

  getAll(query: PaginationQueryDto) {
    return this.productService.request(ProductServiceCommand.brand.getAll, query, BrandPageEntity);
  }

  getByCode(code: string) {
    return this.productService.request(ProductServiceCommand.brand.getByCode, { code }, BrandEntity);
  }

  async create(dto: CreateBrandDto, files: UploadedFile[]) {
    const uploaded: UploadedImage[] = [];

    try {
      const images = await this.imageUpload.resolve(dto.images, files, uploaded);
      return await this.productService.request(ProductServiceCommand.brand.create, { ...dto, images }, BrandEntity);
    } catch (error) {
      await this.imageUpload.rollback(uploaded);
      throw error;
    }
  }

  async update(code: string, dto: UpdateBrandDto, files: UploadedFile[]) {
    const uploaded: UploadedImage[] = [];

    try {
      const images = dto.images === undefined
        ? undefined
        : await this.imageUpload.resolve(dto.images, files, uploaded);
      return await this.productService.request(ProductServiceCommand.brand.update, { ...dto, code, images }, BrandEntity);
    } catch (error) {
      await this.imageUpload.rollback(uploaded);
      throw error;
    }
  }
}
