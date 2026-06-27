import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

import { GetFileQueryDto } from './dto/get-file-query.dto';
import { FileUploadDto } from './dto/file-upload.dto';

import { FileGateway } from './file.gateway';

@Injectable()
export class FileService {
  constructor(private readonly fileGateway: FileGateway) {}

  getAll(folderUuid?: string) {
    return this.fileGateway.getAll(folderUuid);
  }

  upload(files: FileUploadDto[], folderUuid?: string) {
    return this.fileGateway.upload(files, folderUuid);
  }

  getByUuid(uuid: string, query: GetFileQueryDto): Promise<AxiosResponse> {
    return this.fileGateway.getByUuid(uuid, query);
  }

  deleteByUuid(uuid: string) {
    return this.fileGateway.deleteByUuid(uuid);
  }
}
