import { Injectable } from '@nestjs/common';

import { FoldersGateway } from './folders.gateway';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(private readonly folderGateway: FoldersGateway) {}

  findByUuid(uuid: string) {
    return this.folderGateway.findByUuid(uuid);
  }

  findAll(parentUuid: string) {
    return this.folderGateway.findAll(parentUuid);
  }

  create(dto: CreateFolderDto) {
    return this.folderGateway.create(dto);
  }

  update(uuid: string, dto: UpdateFolderDto) {
    return this.folderGateway.update(uuid, dto);
  }

  remove(uuid: string) {
    return this.folderGateway.remove(uuid);
  }
}
