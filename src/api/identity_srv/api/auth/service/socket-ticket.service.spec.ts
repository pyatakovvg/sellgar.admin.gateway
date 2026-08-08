/// <reference types="jest" />

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { SocketTicketService } from './socket-ticket.service';

describe(SocketTicketService.name, () => {
  const audience = 'realtime';
  const secret = 'a-secret-that-is-longer-than-32-characters';
  const sessionId = '09edcfbd-b192-4fc9-a703-f5bf84a67386';
  const userId = '3a4752e0-c56d-4d72-8976-28438f680fb8';
  const jwt = new JwtService();
  const service = new SocketTicketService(
    new ConfigService({
      SOCKET_TICKET_AUDIENCE: audience,
      SOCKET_TICKET_SECRET: secret,
      SOCKET_TICKET_TTL_SECONDS: 60,
    }),
    jwt,
  );

  it('issues a short-lived ticket for the authenticated user and session', async () => {
    const result = await service.issue(sessionId, userId);
    const payload = await jwt.verifyAsync(result.ticket, { audience, secret });

    expect(result.expiresAt).toEqual(expect.any(String));
    expect(payload).toEqual(
      expect.objectContaining({
        rooms: [],
        sid: sessionId,
        sub: userId,
      }),
    );
  });
});
