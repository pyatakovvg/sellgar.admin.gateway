import { Controller, Get, Param, Post, Req, Res, Query } from '@nestjs/common';

import { PassThrough } from 'stream';
import { Request, Response } from 'express';

import { GetFileQueryDto } from './dto/get-file-query.dto';

import { FileService } from './file.service';

@Controller('v1/files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  getAll(@Query('folderUuid') folderUuid?: string) {
    return this.fileService.getAll(folderUuid);
  }

  @Post('upload')
  async upload(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const tunnel = new PassThrough();

    req.pipe(tunnel);

    res.status(200);

    return this.fileService.upload(tunnel, req.headers);
  }

  @Get(':file')
  async getByName(@Param('file') fileName: string, @Query() query: GetFileQueryDto, @Res() res: Response) {
    const stream = await this.fileService.getByName(fileName, query);

    res.header('Accept', 'image/webp');
    res.header('Content-Type', 'binary/octet-stream');

    stream.data.pipe(res);
  }
}
