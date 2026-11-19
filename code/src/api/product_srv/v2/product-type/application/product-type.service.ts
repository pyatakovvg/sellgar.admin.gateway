import { Injectable } from '@nestjs/common';

import { ProductServiceClient } from '../../shared/product-service.client';
import { ProductServiceCommand } from '../../shared/product-service.constants';
import { PaginationQueryDto } from '../../shared/presentation/dto/pagination-query.dto';
import { CreateProductTypeDto } from '../presentation/dto/create-product-type.dto';
import { UpdateProductTypeDto } from '../presentation/dto/update-product-type.dto';
import { ProductTypeEntity, ProductTypePageEntity } from '../product-type.entity';

@Injectable()
export class ProductTypeService {
  constructor(private readonly productService: ProductServiceClient) {}

  getAll(query: PaginationQueryDto) {
    return this.productService.request(ProductServiceCommand.productType.getAll, query, ProductTypePageEntity);
  }

  getByUuid(uuid: string) {
    return this.productService.request(ProductServiceCommand.productType.getByUuid, { uuid }, ProductTypeEntity);
  }

  create(dto: CreateProductTypeDto) {
    return this.productService.request(ProductServiceCommand.productType.create, dto, ProductTypeEntity);
  }

  update(uuid: string, dto: UpdateProductTypeDto) {
    return this.productService.request(ProductServiceCommand.productType.update, { uuid, ...dto }, ProductTypeEntity);
  }
}
