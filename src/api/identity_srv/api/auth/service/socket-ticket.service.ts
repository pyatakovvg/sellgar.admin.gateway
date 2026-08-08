import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface SocketTicket {
  expiresAt: string;
  ticket: string;
}

@Injectable()
export class SocketTicketService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async issue(sessionId: string, userId: string): Promise<SocketTicket> {
    const ttlSeconds = Number(this.config.get('SOCKET_TICKET_TTL_SECONDS') ?? 60);

    if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
      throw new Error('SOCKET_TICKET_TTL_SECONDS must be a positive integer');
    }

    const audience = this.config.getOrThrow<string>('SOCKET_TICKET_AUDIENCE');
    const secret = this.config.getOrThrow<string>('SOCKET_TICKET_SECRET');
    const issuedAt = Math.floor(Date.now() / 1_000);
    const expiresAt = issuedAt + ttlSeconds;

    const ticket = await this.jwt.signAsync(
      {
        exp: expiresAt,
        iat: issuedAt,
        rooms: [],
        sid: sessionId,
        sub: userId,
      },
      {
        audience,
        secret,
      },
    );

    return {
      expiresAt: new Date(expiresAt * 1_000).toISOString(),
      ticket,
    };
  }
}
