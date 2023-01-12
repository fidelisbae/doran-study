import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, //
  ) {}

  /** AccessToken 발급 */
  getAccessToken(
    user: { id: string; nickName: string; password?: string }, //
  ) {
    const accessToken = this.jwtService.sign(
      { id: user.id, nickName: user.nickName },
      { secret: 'accessKey', expiresIn: '1s' },
    );
    return accessToken;
  }

  /** RefreshToken 생성 */
  setRefreshToken(
    user: { id: string; nickName: string }, //
    res: any,
  ) {
    const refreshToken = this.jwtService.sign(
      { id: user.id, nickName: user.nickName },
      { secret: 'refreshToken', expiresIn: '2w' },
    );
    return res.setHeader('Set-Cookie', `refreshToken=${refreshToken}`);
  }
}
