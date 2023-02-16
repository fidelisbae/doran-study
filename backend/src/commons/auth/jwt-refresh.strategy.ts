import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { IPayloadSub } from '../interfaces/payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        try {
          const cookie = req.headers.cookie;
          const refreshToken = cookie.replace('refreshToken=', '');
          return refreshToken;
        } catch (e) {
          throw new UnauthorizedException();
        }
      },
      secretOrKey: process.env.SECRET_FOR_REFRESH,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: IPayloadSub, //
  ) {
    let cookie: string;
    if (req.headers['cookie'] === undefined) {
      throw new UnauthorizedException();
    } else {
      cookie = req.headers['cookie'].replace('refreshToken=', '');
    }

    return {
      id: payload.id,
      nickname: payload.nickName,
    };
  }
}
