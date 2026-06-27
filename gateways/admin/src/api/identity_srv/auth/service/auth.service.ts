import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LoginDto } from './dto/login.dto';

import { AuthGateway } from '../gateway/auth.gateway';

@Injectable()
export class AuthService {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly config: ConfigService,
  ) {}

  public hashPassword(password: string) {
    const md5Hash = crypto.createHmac('sha512', this.config.get('PASSWORD_SALT'));
    return md5Hash.update(password).digest('hex');
  }

  async login(dto: LoginDto) {
    return await this.authGateway.login({
      ...dto,
      password: this.hashPassword(dto.password),
    });
  }
}
