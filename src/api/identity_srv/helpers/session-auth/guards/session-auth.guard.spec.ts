/// <reference types="jest" />

import { UnauthorizedException } from '@nestjs/common';

import { SessionAuthGuard } from './session-auth.guard';

describe('SessionAuthGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  const sessionService = {
    verify: jest.fn(),
    renew: jest.fn(),
  };
  const authCookieService = {
    read: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  };
  const authSessionContextService = {
    build: jest.fn(),
  };
  const sessionContext = {
    clientType: 'web',
    gateway: 'admin_gw',
    device: 'Chrome (GNU/Linux)',
    fingerprint: 'fingerprint',
  };

  let guard: SessionAuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    reflector.getAllAndOverride.mockReturnValue(false);
    authCookieService.read.mockReturnValue('session-secret');
    authSessionContextService.build.mockResolvedValue(sessionContext);
    guard = new SessionAuthGuard(
      reflector as never,
      sessionService as never,
      authCookieService as never,
      authSessionContextService as never,
    );
  });

  it('allows public handlers without reading cookies', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(authCookieService.read).not.toHaveBeenCalled();
  });

  it('rejects requests without a session cookie', async () => {
    authCookieService.read.mockReturnValue(undefined);

    await expect(guard.canActivate(createContext())).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts an active verified session and attaches the user id', async () => {
    const request = {};

    sessionService.verify.mockResolvedValue({
      data: {
        status: 'active',
        userId: '9ed7d1a4-91eb-402a-8028-1654aeb259f5',
      },
      meta: {},
    });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(sessionService.verify).toHaveBeenCalledWith({
      sessionSecret: 'session-secret',
      fingerprint: sessionContext.fingerprint,
      clientType: sessionContext.clientType,
      gateway: sessionContext.gateway,
    });
    expect(request).toEqual({
      user: {
        uuid: '9ed7d1a4-91eb-402a-8028-1654aeb259f5',
      },
    });
  });

  it('renews a session hidden in the gateway when verify returns renew_required', async () => {
    const response = {};

    sessionService.verify.mockResolvedValue({
      data: {
        status: 'renew_required',
      },
      meta: {},
    });
    sessionService.renew.mockResolvedValue({
      sessionId: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
      sessionSecret: 'next-session-secret',
      userId: '9ed7d1a4-91eb-402a-8028-1654aeb259f5',
    });

    await expect(guard.canActivate(createContext({}, response))).resolves.toBe(true);
    expect(sessionService.renew).toHaveBeenCalledWith({
      sessionSecret: 'session-secret',
      fingerprint: sessionContext.fingerprint,
      clientType: sessionContext.clientType,
      gateway: sessionContext.gateway,
    });
    expect(authCookieService.set).toHaveBeenCalledWith(response, 'next-session-secret');
  });

  it('clears the cookie and rejects when renew fails', async () => {
    const response = {};

    sessionService.verify
      .mockResolvedValueOnce({
        data: {
          status: 'renew_required',
        },
        meta: {},
      })
      .mockResolvedValueOnce({
        data: {
          status: 'invalid',
        },
        meta: {},
      });
    sessionService.renew.mockResolvedValue(null);

    await expect(guard.canActivate(createContext({}, response))).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authCookieService.clear).toHaveBeenCalledWith(response);
  });

  it('accepts a session renewed by a parallel request when local renew loses the race', async () => {
    const response = {};

    sessionService.verify
      .mockResolvedValueOnce({
        data: {
          status: 'renew_required',
        },
        meta: {},
      })
      .mockResolvedValueOnce({
        data: {
          status: 'active',
          userId: '9ed7d1a4-91eb-402a-8028-1654aeb259f5',
        },
        meta: {},
      });
    sessionService.renew.mockResolvedValue(null);

    await expect(guard.canActivate(createContext({}, response))).resolves.toBe(true);
    expect(authCookieService.clear).not.toHaveBeenCalled();
    expect(authCookieService.set).not.toHaveBeenCalled();
  });

  function createContext(request: Record<string, unknown> = {}, response: Record<string, unknown> = {}) {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as never;
  }
});
