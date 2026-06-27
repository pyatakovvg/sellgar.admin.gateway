import { Body, Controller, Delete, Get, Param, Post, Res, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { Response } from 'express';

import { GetFileQueryDto } from './dto/get-file-query.dto';
import { FileUploadDto } from './dto/file-upload.dto';

import { FileService } from './file.service';

@Controller('v1/files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  getAll(@Query('folderUuid') folderUuid?: string) {
    return this.fileService.getAll(folderUuid);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async upload(@UploadedFiles() files: FileUploadDto[], @Body('folderUuid') folderUuid?: string) {
    return this.fileService.upload(files, folderUuid);
  }

  @Delete(':uuid')
  deleteByUuid(@Param('uuid') uuid: string) {
    return this.fileService.deleteByUuid(uuid);
  }

  @Get(':uuid')
  async getByUuid(@Param('uuid') uuid: string, @Query() query: GetFileQueryDto, @Res() res: Response) {
    const stream = await this.fileService.getByUuid(uuid, query);

    res.header('Accept', 'image/webp');
    res.header('Content-Type', 'binary/octet-stream');

    stream.data.pipe(res);
  }
}
