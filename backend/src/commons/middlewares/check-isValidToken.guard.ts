import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class CheckIsValidToken implements CanActivate {
  constructor(
    @InjectRedis('access_token')
    private readonly access_token_pool: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log('req', req['headers'].authorization);
    const accessToken = req['headers'].authorization.replace('Bearer ', '');
    const bl_accessToken = await this.access_token_pool.get(accessToken);

    if (bl_accessToken) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    return true;
  }
}
