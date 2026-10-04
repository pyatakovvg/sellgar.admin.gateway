import { IsInt, IsOptional, IsString, IsUUID, Max, Min, ValidateIf } from 'class-validator';

import { ImageReference } from '../../../shared/application/image-reference';

export class BrandImageDto extends ImageReference {
  @ValidateIf((image: BrandImageDto) => !image.localId)
  @IsUUID()
  imageUuid?: string;

  @ValidateIf((image: BrandImageDto) => !image.imageUuid)
  @IsString()
  localId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  sortOrder?: number;
}
