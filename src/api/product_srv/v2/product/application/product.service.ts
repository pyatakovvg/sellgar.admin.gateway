import { Injectable } from '@nestjs/common';

import { ImageUploadService, UploadedImage } from '../../shared/application/image-upload.service';
import { UploadedFile } from '../../shared/application/uploaded-file';
import { ProductServiceClient } from '../../shared/product-service.client';
import { ProductServiceCommand } from '../../shared/product-service.constants';
import { CreateProductDto } from '../presentation/dto/create-product.dto';
import { CreateVariantDto } from '../presentation/dto/create-variant.dto';
import { GetAllProductsDto } from '../presentation/dto/get-all-products.dto';
import { UpdateProductDto } from '../presentation/dto/update-product.dto';
import { UpdateVariantDto } from '../presentation/dto/update-variant.dto';
import { VariantInputDto } from '../presentation/dto/variant-input.dto';
import { ProductEntity, ProductPageEntity } from '../product.entity';

@Injectable()
export class ProductService {
  constructor(
    private readonly productService: ProductServiceClient,
    private readonly imageUpload: ImageUploadService,
  ) {}

  getAll(query: GetAllProductsDto) {
    return this.productService.request(ProductServiceCommand.product.getAll, query, ProductPageEntity);
  }

  getByUuid(uuid: string) {
    return this.productService.request(ProductServiceCommand.product.getByUuid, { uuid }, ProductEntity);
  }

  async create(dto: CreateProductDto, files: UploadedFile[]) {
    const uploaded: UploadedImage[] = [];

    try {
      const variants = [];

      for (const variant of dto.variants) {
        variants.push(await this.resolveVariantImages(variant, files, uploaded));
      }

      return await this.productService.request(
        ProductServiceCommand.product.create,
        { ...dto, variants },
        ProductEntity,
      );
    } catch (error) {
      await this.imageUpload.rollback(uploaded);
      throw error;
    }
  }

  update(uuid: string, dto: UpdateProductDto) {
    return this.productService.request(ProductServiceCommand.product.update, { uuid, ...dto }, ProductEntity);
  }

  archive(uuid: string, version: number) {
    return this.productService.request(ProductServiceCommand.product.archive, { uuid, version }, ProductEntity);
  }

  restore(uuid: string, version: number) {
    return this.productService.request(ProductServiceCommand.product.restore, { uuid, version }, ProductEntity);
  }

  async createVariant(uuid: string, dto: CreateVariantDto, files: UploadedFile[]) {
    const uploaded: UploadedImage[] = [];

    try {
      const variant = await this.resolveVariantImages(dto.variant, files, uploaded);
      return await this.productService.request(
        ProductServiceCommand.product.createVariant,
        { ...dto, uuid, variant },
        ProductEntity,
      );
    } catch (error) {
      await this.imageUpload.rollback(uploaded);
      throw error;
    }
  }

  async updateVariant(
    uuid: string,
    variantUuid: string,
    dto: UpdateVariantDto,
    files: UploadedFile[],
  ) {
    const uploaded: UploadedImage[] = [];

    try {
      const images = dto.images === undefined
        ? undefined
        : await this.imageUpload.resolve(dto.images, files, uploaded);
      return await this.productService.request(ProductServiceCommand.product.updateVariant, {
        ...dto,
        uuid,
        variantUuid,
        images,
      }, ProductEntity);
    } catch (error) {
      await this.imageUpload.rollback(uploaded);
      throw error;
    }
  }

  archiveVariant(uuid: string, variantUuid: string, version: number) {
    return this.productService.request(
      ProductServiceCommand.product.archiveVariant,
      { uuid, variantUuid, version },
      ProductEntity,
    );
  }

  restoreVariant(uuid: string, variantUuid: string, version: number) {
    return this.productService.request(
      ProductServiceCommand.product.restoreVariant,
      { uuid, variantUuid, version },
      ProductEntity,
    );
  }

  private async resolveVariantImages(
    variant: VariantInputDto,
    files: UploadedFile[],
    uploaded: UploadedImage[],
  ) {
    const images = await this.imageUpload.resolve(variant.images, files, uploaded);
    return { ...variant, images };
  }
}
