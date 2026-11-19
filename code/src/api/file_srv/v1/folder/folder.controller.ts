import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

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

  @Post()
  create(@Body() dto: CreateFolderDto) {
    return this.folderService.create(dto);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() dto: UpdateFolderDto) {
    return this.folderService.update(uuid, dto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.folderService.remove(uuid);
  }
}
