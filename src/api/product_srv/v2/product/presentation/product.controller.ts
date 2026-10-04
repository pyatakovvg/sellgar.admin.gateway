import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { UploadedFile } from '../../shared/application/uploaded-file';
import { MultipartJsonInterceptor } from '../../shared/presentation/multipart-json.interceptor';
import { ProductService } from '../application/product.service';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { GetAllProductsDto } from './dto/get-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Controller('v2/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getAll(@Query() query: GetAllProductsDto) {
    return this.productService.getAll(query);
  }

  @Get(':uuid')
  getByUuid(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.productService.getByUuid(uuid);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor(), MultipartJsonInterceptor)
  create(@Body() dto: CreateProductDto, @UploadedFiles() files: UploadedFile[] = []) {
    return this.productService.create(dto, files);
  }

  @Patch(':uuid')
  update(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(uuid, dto);
  }

  @Patch(':uuid/archive')
  archive(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() dto: ChangeStatusDto) {
    return this.productService.archive(uuid, dto.version);
  }

  @Patch(':uuid/restore')
  restore(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() dto: ChangeStatusDto) {
    return this.productService.restore(uuid, dto.version);
  }

  @Post(':uuid/variants')
  @UseInterceptors(AnyFilesInterceptor(), MultipartJsonInterceptor)
  createVariant(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: CreateVariantDto,
    @UploadedFiles() files: UploadedFile[] = [],
  ) {
    return this.productService.createVariant(uuid, dto, files);
  }

  @Patch(':uuid/variants/:variantUuid')
  @UseInterceptors(AnyFilesInterceptor(), MultipartJsonInterceptor)
  updateVariant(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Param('variantUuid', ParseUUIDPipe) variantUuid: string,
    @Body() dto: UpdateVariantDto,
    @UploadedFiles() files: UploadedFile[] = [],
  ) {
    return this.productService.updateVariant(uuid, variantUuid, dto, files);
  }

  @Patch(':uuid/variants/:variantUuid/archive')
  archiveVariant(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Param('variantUuid', ParseUUIDPipe) variantUuid: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.productService.archiveVariant(uuid, variantUuid, dto.version);
  }

  @Patch(':uuid/variants/:variantUuid/restore')
  restoreVariant(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Param('variantUuid', ParseUUIDPipe) variantUuid: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.productService.restoreVariant(uuid, variantUuid, dto.version);
  }
}
