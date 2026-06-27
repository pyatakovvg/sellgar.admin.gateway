import { Controller, Get, Param } from '@nestjs/common';

import { VariantService } from '../service/variant.service';

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
}
