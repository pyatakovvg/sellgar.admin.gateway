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
  const socketTicketService = {
    issue: jest.fn(),
  };
  const loggerWarn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    authSessionContextService.build.mockReturnValue({
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
      socketTicketService as never,
    );
  });

  afterAll(() => {
    loggerWarn.mockRestore();
  });

  it('issues a socket ticket for the identity attached by the session guard', async () => {
    socketTicketService.issue.mockResolvedValue({
      expiresAt: '2026-08-08T12:05:00.000Z',
      ticket: 'signed-ticket',
    });

    await expect(
      controller.issueSocketTicket(
        '09edcfbd-b192-4fc9-a703-f5bf84a67386',
        '3a4752e0-c56d-4d72-8976-28438f680fb8',
      ),
    ).resolves.toEqual({
      expiresAt: '2026-08-08T12:05:00.000Z',
      ticket: 'signed-ticket',
    });
    expect(socketTicketService.issue).toHaveBeenCalledWith(
      '09edcfbd-b192-4fc9-a703-f5bf84a67386',
      '3a4752e0-c56d-4d72-8976-28438f680fb8',
    );
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
    authSessionContextService.build.mockImplementationOnce(() => {
      throw new Error('device_id_required');
    });

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
