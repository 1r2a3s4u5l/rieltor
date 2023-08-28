import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../types';
import { ExtractJwt, Strategy, JwtFromRequestFunction } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayloadWidthRefreshToken } from '../types/jwtpayloadRefresh';

export const cookieExtractor: JwtFromRequestFunction = (req: Request) => {
  if (req && req.cookies) {
    return req.cookies['refresh_token'];
  }
  return null;
};

@Injectable()
export class RefreshTokenFromCookieStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.REFRESH_TOKEN_KEY,
      passReqToCallback: true,
    });
  }
  validate(req: Request, payload: JwtPayload): JwtPayloadWidthRefreshToken {
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader.split(' ')[1];
    console.log('Hello form cookie');
    if (!refreshToken) throw new ForbiddenException("Refresh token noto'g'ri");
    return {
      ...payload,
      refreshToken,
    };
  }
}
