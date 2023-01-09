import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
