import { Controller, Get, Param, Query } from '@nestjs/common';

import { FoldersService } from './folders.service';

@Controller('v1/folders')
export class FolderController {
  constructor(private readonly folderService: FoldersService) {}

  @Get(':uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.folderService.findByUuid(uuid);
  }

  @Get()
  findAll(@Query('parentUuid') parentUuid: string) {
    return this.folderService.findAll(parentUuid);
  }
}
