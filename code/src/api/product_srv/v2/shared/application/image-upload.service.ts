import { randomUUID } from 'crypto';

import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { ImageReference, ResolvedImageReference } from './image-reference';
import { UploadedFile } from './uploaded-file';

export class UploadedImage {
  uuid: string;
  name: string;
  storageKey: string;
  mime: string;
  size: number;
}

class MediaUploadResult {
  storageKey: string;
  mime: string;
  size: number;
}

@Injectable()
export class ImageUploadService {
  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
    @Inject('FILE_SERVICE') private readonly fileClient: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaClient: ClientProxy,
  ) {}

  async resolve(
    references: ImageReference[] | undefined,
    files: UploadedFile[],
    uploaded: UploadedImage[],
  ): Promise<ResolvedImageReference[]> {
    const filesByLocalId = new Map(files.map((file) => [this.localId(file), file]));
    const result: ResolvedImageReference[] = [];

    for (const [index, reference] of (references ?? []).entries()) {
      if (reference.imageUuid) {
        result.push({ imageUuid: reference.imageUuid, sortOrder: reference.sortOrder ?? index });
        continue;
      }

      const file = reference.localId ? filesByLocalId.get(reference.localId) : undefined;

      if (!file) {
        continue;
      }

      const image = await this.upload(file);
      uploaded.push(image);
      result.push({ imageUuid: image.uuid, sortOrder: reference.sortOrder ?? index });
    }

    return result;
  }

  async rollback(images: UploadedImage[]): Promise<void> {
    await Promise.all(images.map((image) => this.delete(image).catch(() => undefined)));
  }

  private async upload(file: UploadedFile): Promise<UploadedImage> {
    const uuid = randomUUID();
    const media = await this.http.axiosRef
      .put<MediaUploadResult>(this.config.getOrThrow<string>('API_MEDIA_SRV') + '/internal/objects', file.buffer, {
        headers: {
          'Content-Type': file.mimetype,
          'Content-Length': file.size,
          'X-File-Uuid': uuid,
          'X-Media-Profile': 'image',
        },
      })
      .then((response) => response.data);

    try {
      return await firstValueFrom(
        this.fileClient.send<UploadedImage>(
          { cmd: 'file.create' },
          { uuid, name: file.originalname, storageKey: media.storageKey, mime: media.mime, size: media.size },
        ),
      );
    } catch (error) {
      await this.deleteMedia(media.storageKey).catch(() => undefined);
      throw error;
    }
  }

  private async delete(image: UploadedImage): Promise<void> {
    await this.deleteMedia(image.storageKey);
    await firstValueFrom(this.fileClient.send({ cmd: 'file.delete' }, { uuid: image.uuid }));
  }

  private deleteMedia(storageKey: string): Promise<unknown> {
    return firstValueFrom(this.mediaClient.send({ cmd: 'media.object.delete' }, { storageKey }));
  }

  private localId(file: UploadedFile): string {
    const separator = file.fieldname.indexOf(':');
    return separator === -1 ? file.fieldname : file.fieldname.slice(separator + 1);
  }
}
