import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePropertyDto {
  @IsUUID()
  groupUuid: string;

  @IsUUID()
  @IsOptional()
  unitUuid: string | null;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  type: 'TEXT' | 'CHECKBOX' | 'RADIO' | 'DATE' | 'RANGE';
}
