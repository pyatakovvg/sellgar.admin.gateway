import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { map } from 'rxjs';

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
}
