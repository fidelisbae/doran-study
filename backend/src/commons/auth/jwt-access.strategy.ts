import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { IPayloadSub } from '../interfaces/payload.interface';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy, //
  'accessToken',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'accessKey',
    });
  }

  /** 검증 성공 시 실행 */
  async validate(
    payload: IPayloadSub, //
  ) {
    return {
      id: payload.id,
      nickname: payload.nickName,
    };
  }
}
