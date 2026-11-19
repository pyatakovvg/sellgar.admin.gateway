import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const AuthSessionId = createParamDecorator((data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest();

  if (!request.user?.sessionId) {
    throw new UnauthorizedException();
  }

  return request.user.sessionId;
});
