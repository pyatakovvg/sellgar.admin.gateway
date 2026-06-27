import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { FingerprintGenerateDto } from './dto/fingerprint-generate.dto';

@Injectable()
export class FingerprintService {
  async generate(dto: FingerprintGenerateDto) {
    const instanceDto = plainToInstance(FingerprintGenerateDto, dto);

    await validateOrReject(instanceDto);

    return crypto
      .createHash('sha256')
      .update(instanceDto.userAgent + instanceDto.deviceName + instanceDto.deviceId)
      .digest('hex');
  }
}
