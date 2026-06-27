import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { PassThrough } from 'stream';
import { firstValueFrom, map, catchError } from 'rxjs';

import { GetFileQueryDto } from './dto/get-file-query.dto';

@Injectable()
export class FileGateway {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  getAll(folderUuid?: string) {
    const request = this.httpService
      .get(this.config.get('API_FILE_SRV') + '/v1/files', {
        params: { folderUuid },
      })
      .pipe(map((res) => res.data));

    return firstValueFrom(request);
  }

  upload(tunnel: PassThrough, headers: any) {
    return this.httpService
      .post(this.config.get('API_FILE_SRV') + '/v1/files/upload', tunnel, {
        headers,
      })
      .pipe(map((res) => res.data))
      .pipe(
        catchError((err) => {
          throw new Error(err);
        }),
      );
  }

  getByName(fileName: string, query: GetFileQueryDto) {
    return this.httpService.axiosRef.get(this.config.get('API_FILE_SRV') + '/v1/files/' + fileName, {
      responseType: 'stream',
      params: query,
    });
  }
}
