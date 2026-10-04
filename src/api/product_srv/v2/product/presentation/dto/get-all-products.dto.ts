import { plainToInstance, Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsUUID, ValidateNested } from 'class-validator';

import { PaginationQueryDto } from '../../../shared/presentation/dto/pagination-query.dto';
import { ProductStatus } from '../../product-status.enum';
import { ProductPropertyFilterDto } from './product-property-filter.dto';

function parseFilters(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export class GetAllProductsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsUUID()
  typeUuid?: string;

  @IsOptional()
  @Transform(({ value }) => plainToInstance(
    ProductPropertyFilterDto,
    parseFilters(value),
  ))
  @IsArray()
  @ValidateNested({ each: true })
  filters?: ProductPropertyFilterDto[];
}
