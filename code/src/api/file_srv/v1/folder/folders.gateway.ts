import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { map } from 'rxjs';

import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersGateway {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  findByUuid(uuid: string) {
    return this.httpService.get(this.config.get('API_FILE_SRV') + '/v1/folders/' + uuid).pipe(map((res) => res.data));
  }

  findAll(parentUuid: string = null) {
    return this.httpService
      .get(this.config.get('API_FILE_SRV') + '/v1/folders', {
        params: { parentUuid },
      })
      .pipe(map((res) => res.data));
  }

  create(dto: CreateFolderDto) {
    return this.httpService.post(this.config.get('API_FILE_SRV') + '/v1/folders', dto).pipe(map((res) => res.data));
  }

  update(uuid: string, dto: UpdateFolderDto) {
    return this.httpService.patch(this.config.get('API_FILE_SRV') + '/v1/folders/' + uuid, dto).pipe(map((res) => res.data));
  }

  remove(uuid: string) {
    return this.httpService.delete(this.config.get('API_FILE_SRV') + '/v1/folders/' + uuid).pipe(map((res) => res.data));
  }
}
