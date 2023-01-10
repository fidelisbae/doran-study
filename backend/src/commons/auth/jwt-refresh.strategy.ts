import { Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { IPayloadSub } from '../interfaces/payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        const refreshToken = req.headers.cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: 'refreshToken',
    });
  }

  validate(
    payload: IPayloadSub, //
  ) {
    return {
      id: payload.id,
      nickname: payload.nickName,
    };
  }
}
