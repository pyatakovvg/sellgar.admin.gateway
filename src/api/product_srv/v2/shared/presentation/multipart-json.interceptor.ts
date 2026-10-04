import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MultipartJsonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ body?: Record<string, unknown> }>();
    const payload = request.body?.payload;

    if (typeof payload !== 'string') {
      return next.handle();
    }

    try {
      const parsed = JSON.parse(payload);

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error();
      }

      request.body = parsed as Record<string, unknown>;
    } catch {
      throw new BadRequestException('Multipart field "payload" must contain a JSON object');
    }

    return next.handle();
  }
}
