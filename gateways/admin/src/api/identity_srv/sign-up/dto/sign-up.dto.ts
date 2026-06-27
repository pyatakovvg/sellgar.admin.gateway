import { IsString, IsNotEmpty } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
