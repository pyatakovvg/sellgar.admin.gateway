import { Injectable } from '@nestjs/common';

import { PassThrough } from 'stream';

import { GetFileQueryDto } from './dto/get-file-query.dto';

import { FileGateway } from './file.gateway';

@Injectable()
export class FileService {
  constructor(private readonly fileGateway: FileGateway) {}

  getAll(folderUuid?: string) {
    return this.fileGateway.getAll(folderUuid);
  }

  upload(tunnel: PassThrough, headers: any) {
    return this.fileGateway.upload(tunnel, headers);
  }

  getByName(fileName: string, query: GetFileQueryDto) {
    return this.fileGateway.getByName(fileName, query);
  }
}
