import { Redis } from 'ioredis';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ERROR } from '../messages/message.enum';

@Injectable()
export class CheckIsValidToken implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,

    @InjectRedis('access_token')
    private readonly access_token_pool: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const accessToken = req['headers'].authorization.replace('Bearer ', '');

    await this.jwtService
      .verifyAsync(accessToken, {
        secret: process.env.SECRET_FOR_ACCESS,
      })
      .catch((error) => {
        throw new UnauthorizedException(ERROR.INVALID_TOKEN);
      });
    const bl_accessToken = await this.access_token_pool.get(accessToken);

    if (bl_accessToken) throw new UnauthorizedException(ERROR.REQUIRED_LOGIN);

    return true;
  }
}
