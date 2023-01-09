import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { AppController } from './app.controller';

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
        __dirname + '/**/*.entity.*', //
      ],
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
