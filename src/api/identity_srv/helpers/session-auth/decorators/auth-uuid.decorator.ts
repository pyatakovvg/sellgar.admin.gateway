import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const AuthUuid = createParamDecorator((data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest();

  if (!request.user) {
    throw new UnauthorizedException();
  }

  return request.user.uuid;
});
