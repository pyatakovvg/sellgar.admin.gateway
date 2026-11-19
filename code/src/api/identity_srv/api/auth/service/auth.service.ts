import { Injectable } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';

import { AuthGateway } from '../gateway/auth.gateway';

@Injectable()
export class AuthService {
  constructor(private readonly authGateway: AuthGateway) {}

  async signIn(dto: LoginDto & { device: string; fingerprint: string; clientType: string; gateway: string }) {
    return await this.authGateway.signIn(dto);
  }
}
