import { Injectable } from '@nestjs/common';

import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductUploadFileDto } from './dto/product-upload-file.dto';

import { ProductGateway } from '../gateway/product.gateway';

@Injectable()
export class ProductService {
  constructor(private readonly productGateway: ProductGateway) {}

  async findAll() {
    return await this.productGateway.findAll();
  }

  async findByUuid(uuid: string) {
    return await this.productGateway.findByUuid(uuid);
  }

  async update(dto: UpdateProductDto, files: ProductUploadFileDto[] = []) {
    return await this.productGateway.update(dto, files);
  }

  async create(dto: CreateProductDto, files: ProductUploadFileDto[] = []) {
    return await this.productGateway.create(dto, files);
  }

}
