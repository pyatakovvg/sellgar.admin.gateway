import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as DeviceDetector from 'device-detector-js';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { AgentEntity } from './agent.entity';

@Injectable()
export class AgentService {
  async get(req: Request): Promise<AgentEntity> {
    const userAgent = req.headers['user-agent'];
    const deviceId = req.headers['x-device-id'] as string;

    const detector = new DeviceDetector();
    const detect = detector.parse(userAgent);
    const deviceName = `${detect.client.name} (${detect.os.name})`;

    const result = plainToInstance(AgentEntity, {
      userAgent,
      deviceId,
      deviceName,
      osName: detect.os.name,
      clientName: detect.client.name,
    });

    await validateOrReject(result);

    return result;
  }
}
