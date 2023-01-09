import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { UserModule } from './apis/users/user.module';

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

    // Modules
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
