import { IsInt, IsOptional, IsString, IsUUID, Max, Min, ValidateIf } from 'class-validator';

import { ImageReference } from '../../../shared/application/image-reference';

export class VariantImageDto extends ImageReference {
  @ValidateIf((image: VariantImageDto) => !image.localId)
  @IsUUID()
  imageUuid?: string;

  @ValidateIf((image: VariantImageDto) => !image.imageUuid)
  @IsString()
  localId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  sortOrder?: number;
}
