import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([AccessTokenStrategy.extractJWT]),
      secretOrKey: config.get('ACCESS_TOKEN_SECRET'),
    });
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && 'token' in req.cookies && req.cookies.user_token.length > 0) {
      return req.cookies.token;
    }
    return null;
  }

  validate(payload: JwtPayload) {
    console.log('refresh token', 'validate');
    return payload;
  }
}
