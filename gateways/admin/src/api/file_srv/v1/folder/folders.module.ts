import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { FoldersService } from './folders.service';
import { FoldersGateway } from './folders.gateway';
import { FolderController } from './folder.controller';

@Module({
  imports: [HttpModule],
  providers: [FoldersService, FoldersGateway],
  controllers: [FolderController],
})
export class FoldersModule {}
