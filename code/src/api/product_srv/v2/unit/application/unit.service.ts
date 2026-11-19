import { Injectable } from '@nestjs/common';

import { ProductServiceClient } from '../../shared/product-service.client';
import { ProductServiceCommand } from '../../shared/product-service.constants';
import { PaginationQueryDto } from '../../shared/presentation/dto/pagination-query.dto';
import { CreateUnitDto } from '../presentation/dto/create-unit.dto';
import { UpdateUnitDto } from '../presentation/dto/update-unit.dto';
import { UnitEntity, UnitPageEntity } from '../unit.entity';

@Injectable()
export class UnitService {
  constructor(private readonly productService: ProductServiceClient) {}

  getAll(query: PaginationQueryDto) {
    return this.productService.request(ProductServiceCommand.unit.getAll, query, UnitPageEntity);
  }

  getByCode(code: string) {
    return this.productService.request(ProductServiceCommand.unit.getByCode, { code }, UnitEntity);
  }

  create(dto: CreateUnitDto) {
    return this.productService.request(ProductServiceCommand.unit.create, dto, UnitEntity);
  }

  update(code: string, dto: UpdateUnitDto) {
    return this.productService.request(ProductServiceCommand.unit.update, { code, ...dto }, UnitEntity);
  }
}
