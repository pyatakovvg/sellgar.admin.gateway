import { Body, Controller, Get, Param, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';

import { BrandService } from '../service/brand.service';

import { UpdateBrandDto } from '../service/dto/update-brand.dto';
import { CreateBrandDto } from '../service/dto/create-brand.dto';
import { ProductUploadFileDto } from '../../product/service/dto/product-upload-file.dto';

@Controller('v2/brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get('/')
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.brandService.findByUuid(uuid);
  }

  @Patch(':uuid')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('uuid') uuid: string,
    @Body('payload') payload: string,
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files: ProductUploadFileDto[],
  ) {
    return this.brandService.update(uuid, this.parsePayload(UpdateBrandDto, payload, body, { uuid }), files);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Body('payload') payload: string,
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files: ProductUploadFileDto[],
  ) {
    return this.brandService.create(this.parsePayload(CreateBrandDto, payload, body), files);
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
