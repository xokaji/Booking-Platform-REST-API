import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  userId: string;
  email: string;
}

/**
 * Pulls the authenticated user (attached to the request by JwtAuthGuard)
 * straight into a controller method parameter, e.g.
 *   create(@CurrentUser() user: CurrentUserPayload)
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
