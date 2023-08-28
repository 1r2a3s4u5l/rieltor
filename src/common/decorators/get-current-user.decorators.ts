import {
  ExecutionContext,
  ForbiddenException,
  createParamDecorator,
} from '@nestjs/common';
import { JwtPayloadWidthRefreshToken } from '../../auth/types/jwtpayloadRefresh';

export const GetCurrentUser = createParamDecorator(
  (
    data: keyof JwtPayloadWidthRefreshToken | undefined,
    context: ExecutionContext,
  ): number => {
    const request = context.switchToHttp().getRequest();
    console.log(data);
    console.log(request.user);

    if (!data) return request.user;
    return request.user[data];
  },
);
