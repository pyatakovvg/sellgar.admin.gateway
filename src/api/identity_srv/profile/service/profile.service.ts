import { Injectable } from '@nestjs/common';

import { ProfileGateway } from '../gateway/profile.gateway';
import { UserGateway } from '../../user/gateway/user.gateway';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userGateway: UserGateway,
    private readonly profileGateway: ProfileGateway,
  ) {}

  async getByUserUuid(userUuid: string) {
    const result = await Promise.all([
      this.userGateway.getByUserUuid(userUuid),
      this.profileGateway.getByUserUuid(userUuid),
    ]);

    return {
      user: result[0],
      person: result[1],
    };
  }
}
