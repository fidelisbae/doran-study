import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../users/user.module';
import { UserEntity } from '../users/entities/user.entity';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({}), //
    TypeOrmModule.forFeature([
      UserEntity, //
    ]),
    UserModule,
  ],
  providers: [
    AuthService, //
  ],
  controllers: [
    AuthController, //
  ],
  exports: [
    AuthService, //
  ],
})
export class AuthModule {}
