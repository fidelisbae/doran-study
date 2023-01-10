import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { Body, ConflictException, Controller, Post, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserService } from '../users/user.service';

import { AuthInput } from './dto/login.input';
import { AuthService } from './auth.service';

@ApiTags('Auth')
// @Controller()
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary: '로그인하기',
  })
  @ApiBody({
    type: AuthInput, //
  })
  @Post('/login')
  async login(
    @Body() input: AuthInput, //
    @Res() res: Response,
  ) {
    // 스펠링체크하세요
    const user = await this.userService.isVailedUser(input.id);

    const isAuthenticated = await bcrypt.compare(input.password, user.password);

    if (!isAuthenticated) {
      throw new ConflictException(
        '비밀번호가 일치하지 않으므로 로그인할 수 없습니다.',
      );
    }

    const accessToken = this.authService.getAccessToken(user);
    // 그냥 토큰만 던져주기보다는 이런식으로?
    return res.status(201).json({ access_token: accessToken });
    // return accessToken;
  }
}
