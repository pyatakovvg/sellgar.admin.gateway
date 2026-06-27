import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import DeviceDetector from 'device-detector-js';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { AgentEntity } from './agent.entity';

@Injectable()
export class AgentService {
  async get(req: Request): Promise<AgentEntity> {
    const userAgent = req.headers['user-agent'] ?? 'unknown';
    const deviceId = (req.headers['x-device-id'] as string | undefined) ?? 'unknown';

    const detector = new DeviceDetector();
    const detect = detector.parse(userAgent);
    const osName = detect.os?.name ?? 'unknown';
    const clientName = detect.client?.name ?? 'unknown';
    const deviceName = `${clientName} (${osName})`;

    const result = plainToInstance(AgentEntity, {
      userAgent,
      deviceId,
      deviceName,
      osName,
      clientName,
    });

    await validateOrReject(result);

    return result;
  }
}
