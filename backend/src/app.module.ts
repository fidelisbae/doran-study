import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatModule } from './apis/chat/chat.module';
import { AuthModule } from './apis/auth/auth.module';
import { UserModule } from './apis/users/user.module';
import { SocketModule } from './commons/socket/socket.module';

@Module({
  imports: [
    ///////////////////////////////////////////////////////////////////////////
    // Environment Config //
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    ///////////////////////////////////////////////////////////////////////////
    // TypeORM //
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: `${process.env.MYSQL_HOST}`,
      port: Number(process.env.MYSQL_DOCKER_PORT),
      username: process.env.MYSQL_USER_NAME,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [
        __dirname + '/apis/**/*.entity.*', //
      ],
      synchronize: true,
      logging: true,
    }),

    //////////////////////////////////////////////////////////////////////
    // Redis //
    RedisModule.forRoot({
      config: [
        {
          host: 'localhost',
          namespace: 'access_token',
          db: 1,
          port: 26379,
        },
        {
          host: 'localhost',
          namespace: 'refresh_token',
          db: 2,
          port: 26379,
        },
        {
          host: 'localhost',
          namespace: 'socket_room',
          db: 3,
          port: 26379,
        },
        {
          host: 'localhost',
          namespace: 'rooms',
          db: 4,
          port: 26379,
        },
        {
          host: 'localhost',
          namespace: 'BannedUsers',
          db: 5,
          port: 26379,
        },
      ],
    }),

    // Modules
    AuthModule,
    ChatModule,
    UserModule,
    SocketModule,
  ],
})
export class AppModule {}
