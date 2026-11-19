import { Injectable } from '@nestjs/common';

import { FindSessionDto } from './dto/find-session.dto';
import { RemoveSessionDto } from './dto/remove-session.dto';
import { VerifySessionDto } from './dto/verify-session.dto';
import { RenewSessionDto } from './dto/renew-session.dto';

import { SessionGateway } from '../gateway/session.gateway';

@Injectable()
export class SessionService {
  constructor(private readonly sessionGateway: SessionGateway) {}

  async find(dto: FindSessionDto) {
    return await this.sessionGateway.find(dto);
  }

  async verify(dto: VerifySessionDto) {
    return await this.sessionGateway.verify(dto);
  }

  async renew(dto: RenewSessionDto) {
    return await this.sessionGateway.renew(dto);
  }

  async remove(dto: RemoveSessionDto) {
    return await this.sessionGateway.remove(dto);
  }
}
