import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { FileService } from './file.service';
import { FileGateway } from './file.gateway';
import { FileController } from './file.controller';

@Module({
  imports: [HttpModule],
  providers: [ConfigService, FileService, FileGateway],
  controllers: [FileController],
})
export class FileModule {}
