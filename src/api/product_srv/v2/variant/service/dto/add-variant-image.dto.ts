import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddVariantImageDto {
  @IsUUID()
  imageUuid: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  alt?: string | null;
}
