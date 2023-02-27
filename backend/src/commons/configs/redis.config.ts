import { ConfigService } from '@nestjs/config';
import {
  RedisModuleAsyncOptions,
  RedisModuleOptions,
} from '@liaoliaots/nestjs-redis';

export class RedisConfig {
  static getRedisConfig(configService: ConfigService): RedisModuleOptions {
    return {
      config: [
        {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_DOCKER_PORT'),
          namespace: 'access_token',
          db: 1,
        },
        {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_DOCKER_PORT'),
          namespace: 'refresh_token',
          db: 2,
        },
        {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_DOCKER_PORT'),
          namespace: 'chat-room',
          db: 3,
        },
        {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_DOCKER_PORT'),
          namespace: 'rooms',
          db: 4,
        },
        {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_DOCKER_PORT'),
          namespace: 'Banned-users',
          db: 5,
        },
        {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_DOCKER_PORT'),
          namespace: 'userList-InTheRoom',
          db: 6,
        },
      ],
    };
  }
}

export const redisConfigAsync: RedisModuleAsyncOptions = {
  useFactory: async (configService: ConfigService) =>
    RedisConfig.getRedisConfig(configService),
  inject: [ConfigService],
};
