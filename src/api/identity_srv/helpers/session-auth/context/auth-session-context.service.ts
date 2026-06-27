import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import DeviceDetector from 'device-detector-js';
import * as crypto from 'crypto';

export type AuthSessionContext = {
  clientType: string;
  gateway: string;
  device: string;
  fingerprint: string;
};

@Injectable()
export class AuthSessionContextService {
  private readonly clientType = 'web';
  private readonly gateway = 'admin_gw';

  build(req: Request): AuthSessionContext {
    const userAgent = this.getRequiredHeader(req, 'user-agent', 'user_agent_required');
    const deviceId = this.getRequiredHeader(req, 'x-device-id', 'device_id_required');
    const device = this.getDeviceName(userAgent);

    return {
      clientType: this.clientType,
      gateway: this.gateway,
      device,
      fingerprint: this.generateFingerprint(userAgent, device, deviceId),
    };
  }

  private getRequiredHeader(req: Request, header: string, code: string): string {
    const value = req.headers[header];

    if (typeof value !== 'string' || !value) {
      throw new BadRequestException({ code });
    }

    return value;
  }

  private getDeviceName(userAgent: string): string {
    const detector = new DeviceDetector();
    const detect = detector.parse(userAgent);
    const clientName = detect.client?.name ?? 'unknown';
    const osName = detect.os?.name ?? 'unknown';

    return `${clientName} (${osName})`;
  }

  private generateFingerprint(userAgent: string, deviceName: string, deviceId: string): string {
    return crypto.createHash('sha256').update(userAgent + deviceName + deviceId).digest('hex');
  }
}
