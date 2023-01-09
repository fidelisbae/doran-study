import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, //
  ) {}

  getAccessToken(
    user: UserEntity, //
  ) {
    const accessToken = this.jwtService.sign(
      { id: user.id },
      { secret: 'accessKey', expiresIn: '1h' },
    );
    return accessToken;
  }
}
