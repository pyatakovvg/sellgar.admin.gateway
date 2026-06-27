import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Request, Response } from 'express';

@Injectable()
export class AuthCookieService {
  constructor(private readonly config: ConfigService) {}

  read(req: Request): string | undefined {
    return req.cookies?.[this.getName()];
  }

  set(res: Response, sessionSecret: string): void {
    res.cookie(this.getName(), sessionSecret, this.getBaseOptions());
  }

  clear(res: Response): void {
    res.clearCookie(this.getName(), this.getBaseOptions());
  }

  private getName(): string {
    const name = this.config.get<string>('AUTH_COOKIE');

    if (!name) {
      throw new Error('AUTH_COOKIE is required');
    }

    return name;
  }

  private getBaseOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.getBooleanConfig('AUTH_COOKIE_SECURE', true),
      sameSite: this.getSameSite(),
      path: this.config.get<string>('AUTH_COOKIE_PATH') ?? '/',
    };
  }

  private getBooleanConfig(key: string, fallback: boolean): boolean {
    const value = this.config.get<string>(key);

    if (value === undefined) {
      return fallback;
    }

    return value === 'true';
  }

  private getSameSite(): CookieOptions['sameSite'] {
    const value = this.config.get<string>('AUTH_COOKIE_SAME_SITE');

    if (value === 'strict' || value === 'lax' || value === 'none') {
      return value;
    }

    return 'lax';
  }
}
