import { Injectable } from '@nestjs/common';

import { FindSessionDto } from './dto/find-session.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { RestoreSessionDto } from './dto/restore-session.dto';
import { RemoveSessionDto } from './dto/remove-session.dto';

import { SessionGateway } from '../gateway/session.gateway';

@Injectable()
export class SessionService {
  constructor(private readonly sessionGateway: SessionGateway) {}

  async find(dto: FindSessionDto) {
    return await this.sessionGateway.find(dto);
  }

  async create(dto: CreateSessionDto) {
    return await this.sessionGateway.create(dto);
  }

  async refresh(dto: RefreshSessionDto) {
    return await this.sessionGateway.refresh(dto);
  }

  async restore(dto: RestoreSessionDto) {
    return await this.sessionGateway.restore(dto);
  }

  async remove(dto: RemoveSessionDto) {
    return await this.sessionGateway.remove(dto);
  }
}
