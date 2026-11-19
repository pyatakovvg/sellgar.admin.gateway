import { Module } from '@nestjs/common';

import { FoldersModule } from './folder/folders.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [FoldersModule, FileModule],
})
export class ApiFileV1Module {}
