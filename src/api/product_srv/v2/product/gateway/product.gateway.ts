import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { firstValueFrom } from 'rxjs';

import { CreateProductDto } from '../service/dto/create-product.dto';
import { ProductUploadFileDto } from '../service/dto/product-upload-file.dto';
import { UpdateProductDto } from '../service/dto/update-product.dto';

import { ProductEntity, ProductResultEntity } from '../product.entity';

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
export class ProductGateway {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    @Inject('PRODUCT_COMMAND_SERVICE') private readonly productProxy: ClientProxy,
    @Inject('FILE_SERVICE') private readonly fileProxy: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaProxy: ClientProxy,
  ) {}

  async findAll() {
    const message = this.productProxy.send({ cmd: 'product.getAll' }, {});

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ProductResultEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async findByUuid(uuid: string) {
    const message = this.productProxy.send({ cmd: 'product.getByUuid' }, { uuid });

    const result = await firstValueFrom(message);
    const resultInstance = plainToInstance(ProductEntity, result);

    await validateOrReject(resultInstance);

    return resultInstance;
  }

  async create(dto: CreateProductDto, files: ProductUploadFileDto[] = []) {
    const uploadedFiles: FileRecord[] = [];

    try {
      const preparedDto = await this.prepareProductImages(dto, files, uploadedFiles);
      const message = this.productProxy.send({ cmd: 'product.create' }, preparedDto);

      const result = await firstValueFrom(message);
      const resultInstance = plainToInstance(ProductEntity, result);

      await validateOrReject(resultInstance);

      return resultInstance;
    } catch (error) {
      await Promise.all(uploadedFiles.map((file) => this.deleteFile(file).catch(() => undefined)));
      throw error;
    }
  }

  async update(dto: UpdateProductDto, files: ProductUploadFileDto[] = []) {
    const existingProduct = await this.findByUuid(dto.uuid);
    const uploadedFiles: FileRecord[] = [];

    try {
      const preparedDto = await this.prepareProductImages(dto, files, uploadedFiles);
      const message = this.productProxy.send({ cmd: 'product.update' }, preparedDto);

      const result = await firstValueFrom(message);
      const resultInstance = plainToInstance(ProductEntity, result);

      await validateOrReject(resultInstance);
      await this.deleteRemovedImages(existingProduct, preparedDto);

      return resultInstance;
    } catch (error) {
      await Promise.all(uploadedFiles.map((file) => this.deleteFile(file).catch(() => undefined)));
      throw error;
    }
  }

  private async prepareProductImages<T extends CreateProductDto | UpdateProductDto>(
    dto: T,
    files: ProductUploadFileDto[],
    uploadedFiles: FileRecord[],
  ): Promise<T> {
    const filesByLocalId = new Map(files.map((file) => [this.getLocalId(file), file]));
    const variants = [];

    for (const variant of dto.variants) {
      const images = [];

      for (const image of variant.images ?? []) {
        if (image.imageUuid) {
          images.push({
            uuid: image.uuid,
            imageUuid: image.imageUuid,
            fileName: image.fileName,
            alt: image.alt ?? null,
          });
          continue;
        }

        if (!image.localId) {
          continue;
        }

        const file = filesByLocalId.get(image.localId);

        if (!file) {
          continue;
        }

        const uploadedFile = await this.createImageFile(file);

        uploadedFiles.push(uploadedFile);
        images.push({
          imageUuid: uploadedFile.uuid,
          fileName: uploadedFile.name,
          alt: image.alt ?? null,
        });
      }

      variants.push({
        ...variant,
        images,
      });
    }

    return {
      ...dto,
      variants,
    };
  }

  private getLocalId(file: ProductUploadFileDto) {
    return file.fieldname.startsWith('gallery:') ? file.fieldname.slice('gallery:'.length) : file.fieldname;
  }

  private async createImageFile(file: ProductUploadFileDto): Promise<FileRecord> {
    const fileUuid = randomUUID();
    const media = await this.uploadImage(fileUuid, file);

    try {
      return await firstValueFrom(
        this.fileProxy.send<FileRecord>(
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

  private async deleteRemovedImages(existingProduct: ProductEntity, dto: UpdateProductDto) {
    const before = this.collectImageUuids(existingProduct);
    const after = this.collectDtoImageUuids(dto);
    const removed = Array.from(before).filter((imageUuid) => !after.has(imageUuid));

    await Promise.all(
      removed.map(async (imageUuid) => {
        const file = await firstValueFrom(this.fileProxy.send<FileRecord>({ cmd: 'file.getByUuid' }, { uuid: imageUuid }));

        await this.deleteFile(file);
      }),
    );
  }

  private collectImageUuids(product: ProductEntity) {
    return new Set(
      (product.variants ?? []).flatMap((variant) => (variant.images ?? []).map((image) => image.imageUuid).filter(Boolean)),
    );
  }

  private collectDtoImageUuids(dto: CreateProductDto) {
    return new Set(dto.variants.flatMap((variant) => (variant.images ?? []).map((image) => image.imageUuid).filter(Boolean)));
  }

  private async deleteFile(file: FileRecord) {
    await this.deleteMediaObject(file.storageKey);
    await firstValueFrom(this.fileProxy.send({ cmd: 'file.delete' }, { uuid: file.uuid }));
  }

  private deleteMediaObject(storageKey: string) {
    return firstValueFrom(this.mediaProxy.send({ cmd: 'media.object.delete' }, { storageKey }));
  }
}
