import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { VariantService } from '../service/variant.service';
import { AddVariantImageDto } from '../service/dto/add-variant-image.dto';

@Controller('v2/variants')
export class VariantController {
  constructor(private readonly productVariantService: VariantService) {}

  @Get()
  findAll() {
    return this.productVariantService.findAll();
  }

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.productVariantService.findByUuid(uuid);
  }

  @Post(':uuid/images')
  addImage(@Param('uuid') uuid: string, @Body() dto: AddVariantImageDto) {
    return this.productVariantService.addImage(uuid, dto);
  }

  @Delete(':uuid/images/:imageUuid')
  removeImage(@Param('uuid') uuid: string, @Param('imageUuid') imageUuid: string) {
    return this.productVariantService.removeImage(uuid, imageUuid);
  }
}
