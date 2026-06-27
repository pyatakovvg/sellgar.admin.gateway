import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

type AuthCookieSameSite = 'strict' | 'lax' | 'none';

@Injectable()
export class AuthCookieService {
  constructor(private readonly config: ConfigService) {}

  getName(): string {
    return this.config.getOrThrow<string>('AUTH_COOKIE');
  }

  getOptions(): CookieOptions {
    return {
      maxAge: this.config.getOrThrow<number>('AUTH_COOKIE_EXTEND'),
      httpOnly: true,
      secure: this.config.getOrThrow<boolean>('AUTH_COOKIE_SECURE'),
      sameSite: this.config.getOrThrow<AuthCookieSameSite>('AUTH_COOKIE_SAME_SITE'),
    };
  }
}
