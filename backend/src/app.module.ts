import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatModule } from './apis/chat/chat.module';
import { AuthModule } from './apis/auth/auth.module';
import { UserModule } from './apis/users/user.module';
import { SocketModule } from './commons/socket/socket.module';
import { redisConfigAsync } from './commons/configs/redis.config';
import { typeOrmConfigAsync } from './commons/configs/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    RedisModule.forRootAsync(redisConfigAsync),

    AuthModule,
    ChatModule,
    UserModule,
    SocketModule,
  ],
})
export class AppModule {}
