import { IsInt, IsString, IsUUID, Matches, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  recordUuid: string;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  quantity: number;
}

export class RemoveCartItemDto {
  @IsString()
  @Matches(/^[1-9]\d*$/)
  version: string;
}

export class SetCartItemDto extends RemoveCartItemDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  quantity: number;
}
