import { Body, Controller, Get, Param, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';

import { ProductService } from '../service/product.service';
import { UpdateProductDto } from '../service/dto/update-product.dto';
import { CreateProductDto } from '../service/dto/create-product.dto';
import { ProductUploadFileDto } from '../service/dto/product-upload-file.dto';

@Controller('v2/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.productService.findByUuid(uuid);
  }

  @Patch(':uuid')
  @UseInterceptors(AnyFilesInterceptor())
  update(@Param('uuid') uuid: string, @Body('payload') payload: string, @UploadedFiles() files: ProductUploadFileDto[]) {
    return this.productService.update(this.parsePayload(UpdateProductDto, payload, { uuid }), files);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(@Body('payload') payload: string, @UploadedFiles() files: ProductUploadFileDto[]) {
    return this.productService.create(this.parsePayload(CreateProductDto, payload), files);
  }

  private parsePayload<T extends object>(ClassRef: new () => T, payload: string, patch?: Partial<T>): T {
    return plainToInstance(ClassRef, {
      ...JSON.parse(payload),
      ...patch,
    });
  }
}
