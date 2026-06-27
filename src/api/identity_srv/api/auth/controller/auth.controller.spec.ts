/// <reference types="jest" />

import { Logger } from '@nestjs/common';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authService = {
    signIn: jest.fn(),
  };
  const sessionService = {
    remove: jest.fn(),
  };
  const authCookieService = {
    read: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  };
  const authSessionContextService = {
    build: jest.fn(),
  };
  const loggerWarn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    authSessionContextService.build.mockResolvedValue({
      clientType: 'web',
      gateway: 'admin_gw',
      device: 'Chrome (GNU/Linux)',
      fingerprint: 'fingerprint',
    });
    controller = new AuthController(
      authService as never,
      sessionService as never,
      authCookieService as never,
      authSessionContextService as never,
    );
  });

  afterAll(() => {
    loggerWarn.mockRestore();
  });

  it('signs out without a cookie as an idempotent success', async () => {
    const response = createResponse();
    authCookieService.read.mockReturnValue(undefined);

    await controller.signOut({} as never, response as never);

    expect(authSessionContextService.build).not.toHaveBeenCalled();
    expect(sessionService.remove).not.toHaveBeenCalled();
    expect(authCookieService.clear).toHaveBeenCalledWith(response);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ data: null, meta: {} });
  });

  it('clears the cookie and succeeds even when revoke context cannot be built', async () => {
    const response = createResponse();
    authCookieService.read.mockReturnValue('session-secret');
    authSessionContextService.build.mockRejectedValue(new Error('device_id_required'));

    await controller.signOut({} as never, response as never);

    expect(sessionService.remove).not.toHaveBeenCalled();
    expect(authCookieService.clear).toHaveBeenCalledWith(response);
    expect(loggerWarn).toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('revokes a session when context is available', async () => {
    const response = createResponse();
    authCookieService.read.mockReturnValue('session-secret');

    await controller.signOut({} as never, response as never);

    expect(sessionService.remove).toHaveBeenCalledWith({
      sessionSecret: 'session-secret',
      fingerprint: 'fingerprint',
      clientType: 'web',
      gateway: 'admin_gw',
    });
    expect(authCookieService.clear).toHaveBeenCalledWith(response);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  function createResponse() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  }
});
