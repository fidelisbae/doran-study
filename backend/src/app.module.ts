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
    ///////////////////////////////////////////////////////////////////////////
    // TypeORM //
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 23306,
      username: 'root',
      password: '1234',
      database: 'doran',
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
          port: 6379,
        },
        {
          host: 'localhost',
          namespace: 'refresh_token',
          db: 2,
          port: 6379,
        },
      ],
    }),

    // Modules
    UserModule,
    AuthModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
