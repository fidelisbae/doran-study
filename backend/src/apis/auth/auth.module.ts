import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../users/user.module';
import { UserEntity } from '../users/entities/user.entity';

import { JwtAccessStrategy } from 'src/commons/auth/jwt-access.strategy';

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
    JwtAccessStrategy,
  ],
  controllers: [
    AuthController, //
  ],
  exports: [
    AuthService, //
    JwtAccessStrategy,
  ],
})
export class AuthModule {}
