/// <reference types="jest" />

import { AuthCookieService } from './auth-cookie.service';

describe('AuthCookieService', () => {
  const config = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        AUTH_COOKIE: 'admin.sid',
        AUTH_COOKIE_SECURE: 'false',
        AUTH_COOKIE_SAME_SITE: 'lax',
        AUTH_COOKIE_PATH: '/',
      };

      return values[key];
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets a session cookie without gateway-owned max age', () => {
    const service = new AuthCookieService(config as never);
    const response = {
      cookie: jest.fn(),
    };

    service.set(response as never, 'session-secret');

    expect(response.cookie).toHaveBeenCalledWith('admin.sid', 'session-secret', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    expect(response.cookie.mock.calls[0][2]).not.toHaveProperty('maxAge');
    expect(response.cookie.mock.calls[0][2]).not.toHaveProperty('expires');
  });

  it('clears the cookie with the same base parameters', () => {
    const service = new AuthCookieService(config as never);
    const response = {
      clearCookie: jest.fn(),
    };

    service.clear(response as never);

    expect(response.clearCookie).toHaveBeenCalledWith('admin.sid', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
  });
});
