import { Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy, //
  'access',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.forAuthHeaderAsBearerToken(),
      secretOrKey: 'accessKey',
    });
  }

  async validate(
    payload: any, //
  ) {}
}
