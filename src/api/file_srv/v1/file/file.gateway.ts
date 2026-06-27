import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { AxiosResponse } from 'axios';

import { firstValueFrom, map, catchError } from 'rxjs';

import { GetFileQueryDto } from './dto/get-file-query.dto';
import { FileUploadDto } from './dto/file-upload.dto';

interface FileRecord {
  uuid: string;
  name: string;
  storageKey: string;
  mime: string;
  size: number;
}

interface MediaUploadResult {
  storageKey: string;
  mime: string;
  size: number;
}

@Injectable()
export class FileGateway {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    @Inject('FILE_SERVICE') private readonly fileService: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaService: ClientProxy,
  ) {}

  getAll(folderUuid?: string) {
    return firstValueFrom(this.fileService.send({ cmd: 'file.getAll' }, { folderUuid }));
  }

  async upload(files: FileUploadDto[], folderUuid?: string) {
    const result = [];

    for (const file of files) {
      const fileUuid = randomUUID();
      const media = await this.uploadObject(fileUuid, file, 'raw');

      try {
        result.push(await this.createFile(fileUuid, file, media, folderUuid));
      } catch (error) {
        await this.deleteMediaObject(media.storageKey).catch(() => undefined);
        throw error;
      }
    }

    return result;
  }

  getByUuid(uuid: string, query: GetFileQueryDto): Promise<AxiosResponse> {
    return this.httpService.axiosRef.get(this.config.get('API_MEDIA_SRV') + '/images/' + uuid, {
      responseType: 'stream',
      params: query,
    });
  }

  private createFile(uuid: string, file: FileUploadDto, media: MediaUploadResult, folderUuid?: string) {
    return firstValueFrom(
      this.fileService.send<FileRecord>(
        { cmd: 'file.create' },
        {
          uuid,
          name: file.originalname,
          storageKey: media.storageKey,
          mime: media.mime,
          size: media.size,
          folderUuid,
        },
      ),
    );
  }

  private uploadObject(fileUuid: string, file: FileUploadDto, profile: 'raw' | 'image') {
    return firstValueFrom(
      this.httpService
        .put(this.config.get('API_MEDIA_SRV') + '/internal/objects', file.buffer, {
          headers: {
            'Content-Type': file.mimetype,
            'Content-Length': file.size,
            'X-File-Uuid': fileUuid,
            'X-Media-Profile': profile,
          },
        })
        .pipe(map((res) => res.data))
        .pipe(
          catchError((err) => {
            throw new Error(err);
          }),
        ),
    );
  }

  async deleteByUuid(uuid: string) {
    const file = await firstValueFrom(this.fileService.send<FileRecord>({ cmd: 'file.getByUuid' }, { uuid }));

    await this.deleteMediaObject(file.storageKey);
    return firstValueFrom(this.fileService.send({ cmd: 'file.delete' }, { uuid }));
  }

  private deleteMediaObject(storageKey: string) {
    return firstValueFrom(this.mediaService.send({ cmd: 'media.object.delete' }, { storageKey }));
  }
}
