import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

import { CategoryResultEntity, CategoryEntity } from '../category.entity';
import { ProductUploadFileDto } from '../../product/service/dto/product-upload-file.dto';

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
export class CategoryService {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    @Inject('PRODUCT_COMMAND_SERVICE') private readonly productService: ClientProxy,
    @Inject('FILE_SERVICE') private readonly fileService: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaService: ClientProxy,
  ) {}

  async findAll() {
    const message = this.productService.send({ cmd: 'category.findAll' }, {});

    const result = await firstValueFrom(message);

    const resultInstance = plainToInstance(CategoryResultEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const message = this.productService.send({ cmd: 'category.findByUuid' }, { uuid });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(CategoryEntity, result, {
      strategy: 'excludeAll',
    });

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async update(uuid: string, dto: UpdateCategoryDto, files: ProductUploadFileDto[] = []) {
    if (uuid !== dto.uuid) {
      throw Error('Not persistent');
    }

    const existingCategory = await this.findByUuid(uuid);
    const uploadedFiles: FileRecord[] = [];

    try {
      const preparedDto = await this.prepareImage(dto, files, uploadedFiles);
      const message = this.productService.send({ cmd: 'category.update' }, preparedDto);

      const result = await firstValueFrom(message);
      const resultInstance = plainToInstance(CategoryEntity, result, {
        strategy: 'excludeAll',
      });

      await validateOrReject(resultInstance);
      await this.deleteRemovedImage(existingCategory, preparedDto);

      return resultInstance;
    } catch (error) {
      await Promise.all(uploadedFiles.map((file) => this.deleteFile(file).catch(() => undefined)));
      throw error;
    }
  }

  async create(dto: CreateCategoryDto, files: ProductUploadFileDto[] = []) {
    const uploadedFiles: FileRecord[] = [];

    try {
      const preparedDto = await this.prepareImage(dto, files, uploadedFiles);
      const message = this.productService.send({ cmd: 'category.create' }, preparedDto);

      const result = await firstValueFrom(message);
      const resultInstance = plainToInstance(CategoryEntity, result, {
        strategy: 'excludeAll',
      });

      await validateOrReject(resultInstance);

      return resultInstance;
    } catch (error) {
      await Promise.all(uploadedFiles.map((file) => this.deleteFile(file).catch(() => undefined)));
      throw error;
    }
  }

  private async prepareImage<T extends CreateCategoryDto | UpdateCategoryDto>(
    dto: T,
    files: ProductUploadFileDto[],
    uploadedFiles: FileRecord[],
  ): Promise<T> {
    if (dto.image?.imageUuid) {
      return {
        ...dto,
        image: {
          imageUuid: dto.image.imageUuid,
          fileName: dto.image.fileName,
          alt: dto.image.alt ?? null,
        },
      };
    }

    if (!dto.image?.localId) {
      return {
        ...dto,
        image: null,
      };
    }

    const file = files.find((item) => this.getLocalId(item) === dto.image?.localId);

    if (!file) {
      return {
        ...dto,
        image: null,
      };
    }

    const uploadedFile = await this.createImageFile(file);

    uploadedFiles.push(uploadedFile);

    return {
      ...dto,
      image: {
        imageUuid: uploadedFile.uuid,
        fileName: uploadedFile.name,
        alt: dto.image.alt ?? null,
      },
    };
  }

  private getLocalId(file: ProductUploadFileDto) {
    return file.fieldname.startsWith('image:') ? file.fieldname.slice('image:'.length) : file.fieldname;
  }

  private async createImageFile(file: ProductUploadFileDto): Promise<FileRecord> {
    const fileUuid = randomUUID();
    const media = await this.uploadImage(fileUuid, file);

    try {
      return await firstValueFrom(
        this.fileService.send<FileRecord>(
          { cmd: 'file.create' },
          {
            uuid: fileUuid,
            name: file.originalname,
            storageKey: media.storageKey,
            mime: media.mime,
            size: media.size,
          },
        ),
      );
    } catch (error) {
      await this.deleteMediaObject(media.storageKey).catch(() => undefined);
      throw error;
    }
  }

  private uploadImage(fileUuid: string, file: ProductUploadFileDto) {
    return this.httpService.axiosRef
      .put<MediaUploadResult>(this.config.get('API_MEDIA_SRV') + '/internal/objects', file.buffer, {
        headers: {
          'Content-Type': file.mimetype,
          'Content-Length': file.size,
          'X-File-Uuid': fileUuid,
          'X-Media-Profile': 'image',
        },
      })
      .then((response) => response.data);
  }

  private async deleteRemovedImage(existingCategory: CategoryEntity, dto: UpdateCategoryDto) {
    const before = existingCategory.image?.imageUuid;
    const after = dto.image?.imageUuid;

    if (!before || before === after) {
      return;
    }

    const file = await firstValueFrom(this.fileService.send<FileRecord>({ cmd: 'file.getByUuid' }, { uuid: before }));

    await this.deleteFile(file);
  }

  private async deleteFile(file: FileRecord) {
    await this.deleteMediaObject(file.storageKey);
    await firstValueFrom(this.fileService.send({ cmd: 'file.delete' }, { uuid: file.uuid }));
  }

  private deleteMediaObject(storageKey: string) {
    return firstValueFrom(this.mediaService.send({ cmd: 'media.object.delete' }, { storageKey }));
  }
}
