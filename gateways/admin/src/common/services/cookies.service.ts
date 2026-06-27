import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class CookiesService {
  extractAccessTokenFromCookie(cookie: string): string {
    if (cookie) {
      try {
        const encodedCookie = JSON.parse(cookie);
        if ('accessToken' in encodedCookie) {
          return encodedCookie.accessToken;
        }
        throw new UnauthorizedException('В объекте cookie нет свойства "accessToken" для извлечения access token');
      } catch (e) {
        throw new UnauthorizedException('Неверные данные cookie для извлечения access token');
      }
    }
    throw new UnauthorizedException('Нет cookie для извлечения access token');
  }

  extractRefreshTokenFromCookie(cookie: string): string {
    if (cookie) {
      try {
        const encodedCookie = JSON.parse(cookie);
        if ('refreshToken' in encodedCookie) {
          return encodedCookie.refreshToken;
        }
        throw new UnauthorizedException('В объекте cookie нет свойства "refreshToken" для извлечения refresh token');
      } catch (e) {
        throw new UnauthorizedException('Неверные данные cookie для извлечения refresh token');
      }
    }
    throw new UnauthorizedException('Нет cookie для извлечения refresh token');
  }

  extractSessionUuidFromCookie(cookie: string): string {
    if (cookie) {
      try {
        const encodedCookie = JSON.parse(cookie);
        if ('sessionUuid' in encodedCookie) {
          return encodedCookie.sessionUuid;
        }
        throw new UnauthorizedException('В объекте cookie нет свойства "sessionUuid" для извлечения session uuid');
      } catch (e) {
        throw new UnauthorizedException('Неверные данные cookie для извлечения session uuid');
      }
    }
    throw new UnauthorizedException('Нет cookie для извлечения session uuid');
  }

  extractExpiresAtFromCookie(cookie: string): string {
    if (cookie) {
      try {
        const encodedCookie = JSON.parse(cookie);
        if ('expiresAt' in encodedCookie) {
          return encodedCookie.expiresAt;
        }
        throw new UnauthorizedException('В объекте cookie нет свойства "expiresAt" для извлечения expires date');
      } catch (e) {
        throw new UnauthorizedException('Неверные данные cookie для извлечения expires date');
      }
    }
    throw new UnauthorizedException('Нет cookie для извлечения expires date');
  }
}
