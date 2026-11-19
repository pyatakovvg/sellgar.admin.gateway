import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

const integer = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;

export class GetAllCartsDto {
  @IsOptional()
  @IsUUID()
  shopUuid?: string;

  @IsOptional()
  @IsUUID()
  ownerUuid?: string;

  @IsOptional()
  @IsIn(['active', 'closed'])
  status?: 'active' | 'closed';

  @Transform(integer)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 50;

  @Transform(integer)
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  offset = 0;
}
