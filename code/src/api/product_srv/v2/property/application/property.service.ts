import { Injectable } from '@nestjs/common';

import { ProductServiceClient } from '../../shared/product-service.client';
import { ProductServiceCommand } from '../../shared/product-service.constants';
import { PaginationQueryDto } from '../../shared/presentation/dto/pagination-query.dto';
import { CreatePropertyDto } from '../presentation/dto/create-property.dto';
import { CreatePropertyOptionDto } from '../presentation/dto/create-property-option.dto';
import { UpdatePropertyDto } from '../presentation/dto/update-property.dto';
import { UpdatePropertyOptionDto } from '../presentation/dto/update-property-option.dto';
import { PropertyEntity, PropertyPageEntity } from '../property.entity';

@Injectable()
export class PropertyService {
  constructor(private readonly productService: ProductServiceClient) {}

  getAll(query: PaginationQueryDto) {
    return this.productService.request(ProductServiceCommand.property.getAll, query, PropertyPageEntity);
  }

  getByCode(code: string) {
    return this.productService.request(ProductServiceCommand.property.getByCode, { code }, PropertyEntity);
  }

  create(dto: CreatePropertyDto) {
    return this.productService.request(ProductServiceCommand.property.create, dto, PropertyEntity);
  }

  update(code: string, dto: UpdatePropertyDto) {
    return this.productService.request(ProductServiceCommand.property.update, { code, ...dto }, PropertyEntity);
  }

  createOption(code: string, dto: CreatePropertyOptionDto) {
    return this.productService.request(ProductServiceCommand.property.createOption, { code, ...dto }, PropertyEntity);
  }

  updateOption(code: string, optionCode: string, dto: UpdatePropertyOptionDto) {
    return this.productService.request(
      ProductServiceCommand.property.updateOption,
      { code, optionCode, ...dto },
      PropertyEntity,
    );
  }
}
