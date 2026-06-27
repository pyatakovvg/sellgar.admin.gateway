import { Injectable } from '@nestjs/common';

import { FoldersGateway } from './folders.gateway';

@Injectable()
export class FoldersService {
  constructor(private readonly folderGateway: FoldersGateway) {}

  findByUuid(uuid: string) {
    return this.folderGateway.findByUuid(uuid);
  }

  findAll(parentUuid: string) {
    return this.folderGateway.findAll(parentUuid);
  }
}
