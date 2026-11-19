import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { UploadedFile } from '../../shared/application/uploaded-file';
import { PaginationQueryDto } from '../../shared/presentation/dto/pagination-query.dto';
import { MultipartJsonInterceptor } from '../../shared/presentation/multipart-json.interceptor';
import { BrandService } from '../application/brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('v2/brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  getAll(@Query() query: PaginationQueryDto) {
    return this.brandService.getAll(query);
  }

  @Get(':code')
  getByCode(@Param('code') code: string) {
    return this.brandService.getByCode(code);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor(), MultipartJsonInterceptor)
  create(@Body() dto: CreateBrandDto, @UploadedFiles() files: UploadedFile[] = []) {
    return this.brandService.create(dto, files);
  }

  @Patch(':code')
  @UseInterceptors(AnyFilesInterceptor(), MultipartJsonInterceptor)
  update(
    @Param('code') code: string,
    @Body() dto: UpdateBrandDto,
    @UploadedFiles() files: UploadedFile[] = [],
  ) {
    return this.brandService.update(code, dto, files);
  }
}
