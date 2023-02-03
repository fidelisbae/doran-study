import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { UserModule } from './apis/users/user.module';
import { AuthModule } from './apis/auth/auth.module';
import { SocketModule } from './commons/socket/socket.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 33306,
      username: 'root',
      password: '1234',
      database: 'doran',
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true,
      logging: true,
    }),
    RedisModule.forRoot({
      config: [
        {
          host: 'localhost',
          namespace: 'access_token',
          db: 1,
          port: 36379,
        },
        {
          host: 'localhost',
          namespace: 'refresh_token',
          db: 2,
          port: 36379,
        },
      ],
    }),
    UserModule,
    AuthModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
