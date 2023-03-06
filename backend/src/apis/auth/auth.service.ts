import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { ERROR } from 'src/commons/messages/message.enum';

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

  /** 로그인 */
  async login(id: string, pwd: string, res: any) {
    const user = await this.userService.isValidUser(id);
    const isAuthenticated = await bcrypt.compare(pwd, user.password);
    if (!isAuthenticated)
      throw new UnauthorizedException(ERROR.INVALID_USER_PASSWORD);

    await this.setRefreshToken(user, res);
    return await this.setAccessToken(user);
  }

  /** 로그아웃 */
  async logout(userID: string, req: any) {
    const refreshToken = req['headers'].cookie.replace('refreshToken=', '');
    const accessToken = req['headers'].authorization.replace('Bearer ', '');

    let result = false;
    const user = await this.userService.isValidUser(userID);

    if (!user) {
      throw new ConflictException(ERROR.NOT_EXIST_USER);
    } else {
      result = true;
    }

    try {
      const isAccessToken = await this.access_token_pool.get(accessToken);
      const isRefreshToken = await this.refresh_token_pool.get(refreshToken);
      if (isAccessToken && isRefreshToken)
        throw new ConflictException(ERROR.CAN_NOT_LOGOUT);

      await this.setBlackList(userID, accessToken, refreshToken);
      return result;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /** AccessToken 재발급 */
  async restoreAccessToken(req: any, res: any) {
    const user = await this.userService.isValidUser(req['user'].id);

    const oldAccessToken = req['headers'].authorization.replace('Bearer ', '');
    const oldRefreshToken = req['headers'].cookie.replace('refreshToken=', '');

    await this.setBlackList(user.id, oldAccessToken, oldRefreshToken);
    await this.setRefreshToken(user, res);
    return await this.setAccessToken(user);
  }

  /** AccessToken 발급 */
  async setAccessToken(user: UserEntity) {
    try {
      return this.jwtService.sign(
        { id: user.id, nickName: user.nickName },
        { secret: process.env.SECRET_FOR_ACCESS, expiresIn: '1h' },
      );
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /** RefreshToken 발급 */
  async setRefreshToken(user: UserEntity, res: any) {
    try {
      const refreshToken = this.jwtService.sign(
        { id: user.id, nickName: user.nickName },
        { secret: process.env.SECRET_FOR_REFRESH, expiresIn: '2w' },
      );
      return res.setHeader(
        'Set-Cookie',
        `refreshToken=${refreshToken}; path=/; domain=.jp.ngrok.io; SameSite=None; Secure; httpOnly;`,
      );
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /** 블랙리스트 등록하기 */
  async setBlackList(
    userID: string,
    accessToken: string,
    refreshToken: string,
  ) {
    try {
      await this.access_token_pool.set(accessToken, userID, 'EX', 3600);
      await this.refresh_token_pool.set(
        refreshToken,
        userID,
        'EX',
        3600 * 24 * 14,
      );
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
