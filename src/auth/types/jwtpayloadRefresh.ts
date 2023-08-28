import { JwtPayload } from '.';

export type JwtPayloadWidthRefreshToken = JwtPayload & { refreshToken: string };
