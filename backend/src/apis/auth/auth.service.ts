import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { ConflictException, Injectable } from '@nestjs/common';

import { UserEntity } from '../users/entities/user.entity';
import { UserService } from '../users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, //
    private readonly userService: UserService,

    @InjectRedis('refresh_token')
    private readonly refresh_token_pool: Redis,

    @InjectRedis('access_token')
    private readonly access_token_pool: Redis,
  ) {}

  /** 로그아웃 */
  async logout(
    userID: string,
    accessToken: string,
    refreshToken: string, //
  ) {
    let result = false;
    const user = await this.userService.isValidUser(userID);

    if (!user) {
      throw new ConflictException('존재하지 않는 회원입니다.');
    } else {
      result = true;
    }

    const isAccessToken = await this.access_token_pool.get(
      accessToken.replace('Bearer ', ''),
    );
    const isRefreshToken = await this.refresh_token_pool.get(
      refreshToken.replace('refreshToken=', ''),
    );

    if (isAccessToken && isRefreshToken) {
      throw new ConflictException('이미 로그아웃 처리가 되었습니다.');
    }

    await this.access_token_pool.set(
      accessToken.replace('Bearer ', ''),
      userID,
      'EX',
      30,
    );

    await this.refresh_token_pool.set(
      refreshToken.replace('refreshToken=', ''),
      userID,
      'EX',
      3600 * 24 * 14,
    );

    return result === true
      ? '로그아웃 되었습니다.'
      : '로그아웃을 할 수 없습니다.';
  }

  /** AccessToken 발급 */
  getAccessToken(
    user: UserEntity, //
  ) {
    const accessToken = this.jwtService.sign(
      { id: user.id, nickName: user.nickName },
      { secret: 'accessKey', expiresIn: '1h' },
    );
    return accessToken;
  }

  /** RefreshToken 생성 */
  setRefreshToken(
    user: UserEntity, //
    res: any,
  ) {
    const refreshToken = this.jwtService.sign(
      { id: user.id, nickName: user.nickName },
      { secret: 'refreshToken', expiresIn: '2w' },
    );
    return res.setHeader('Set-Cookie', `refreshToken=${refreshToken}`);
  }
}
