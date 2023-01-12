import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { UserService } from '../users/user.service';

import { AuthInput } from './dto/login.input';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
    private readonly userService: UserService,
  ) {}

  //////////////////////////////////////////////////////////
  /** 로그인하기 */
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
    const user = await this.userService.isValidUser(input.id);
    const isAuthenticated = await bcrypt.compare(input.password, user.password);

    if (!isAuthenticated) {
      throw new UnauthorizedException(
        '비밀번호가 일치하지 않으므로 로그인할 수 없습니다.',
      );
    }

    this.authService.setRefreshToken(user, res);
    const accessToken = this.authService.getAccessToken(user);

    return res.status(201).json({ accessToken: accessToken });
  }

  // ////////////////////////////////////////////////////////////
  // accessToken 되살리기
  @ApiBearerAuth('access-token or refresh-token')
  @ApiUnauthorizedResponse({ description: 'Invalid Credential' })
  @UseGuards(AuthGuard('refreshToken'))
  @Post('/restoreAccessToken')
  async restoreAccessToken(
    @Req() req: Express.Request, //
    @Res() res: Response,
  ) {
    const userInfo = req['user'];
    const user = await this.userService.isValidUser(userInfo.id);

    await this.authService.setRefreshToken(user, res);
    const accessToken = this.authService.getAccessToken(user);
    return res.status(201).json({ accessToken: accessToken });
  }
}
