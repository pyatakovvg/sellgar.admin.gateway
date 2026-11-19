import { IsInt, Max, Min } from 'class-validator';

export class ChangeStatusDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  version: number;
}
