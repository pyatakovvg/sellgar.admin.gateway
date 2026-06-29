import { Body, Controller, Get, Param, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';

import { CategoryService } from '../service/category.service';

import { UpdateCategoryDto } from '../service/dto/update-category.dto';
import { CreateCategoryDto } from '../service/dto/create-category.dto';
import { ProductUploadFileDto } from '../../product/service/dto/product-upload-file.dto';

@Controller('v2/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.categoryService.findByUuid(uuid);
  }

  @Patch(':uuid')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('uuid') uuid: string,
    @Body('payload') payload: string,
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files: ProductUploadFileDto[],
  ) {
    return this.categoryService.update(uuid, this.parsePayload(UpdateCategoryDto, payload, body, { uuid }), files);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Body('payload') payload: string,
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files: ProductUploadFileDto[],
  ) {
    return this.categoryService.create(this.parsePayload(CreateCategoryDto, payload, body), files);
  }

  private parsePayload<T extends object>(
    ClassRef: new () => T,
    payload: string | undefined,
    body: Record<string, unknown>,
    patch?: Partial<T>,
  ): T {
    const data = payload ? JSON.parse(payload) : body;

    return plainToInstance(ClassRef, {
      ...data,
      ...patch,
    });
  }
}
