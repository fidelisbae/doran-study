import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, //
  ) {}

  getAccessToken(
    user: UserEntity, //
  ) {
    const accessToken = this.jwtService.sign(
      { id: user.id, nickName: user.nickName },
      { secret: 'accessKey', expiresIn: '1h' },
    );
    return accessToken;
  }
}
