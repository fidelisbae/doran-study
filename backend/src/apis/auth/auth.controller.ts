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

import { ERROR } from 'src/commons/messages/message.enum';
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
  @ApiBody({ type: AuthInput })
  @Post('/login')
  async login(
    @Body() input: AuthInput, //
    @Res() res: Response,
  ) {
    const result = await this.authService.login(input.id, input.password, res);
    return res.status(201).json({ accessToken: result });
  }

  /** 로그아웃 */
  @ApiBearerAuth('access-token or refresh-token')
  @ApiUnauthorizedResponse({ description: 'Invalid Credential' })
  @UseGuards(AuthGuard('accessToken'))
  @Post('/logout')
  async logout(
    @Req() req: Express.Request,
    @Res() res: Response, //
  ) {
    const result = await this.authService.logout(req['user'].id, req);
    return result
      ? res.status(201).json(ERROR.SESSION_SUCCESS_PASSED)
      : res.status(404).json(ERROR.SESSION_DESTROY_FAILED);
  }

  // ////////////////////////////////////////////////////////////
  /** accessToken 재발급 */
  @ApiBearerAuth('access-token or refresh-token')
  @ApiUnauthorizedResponse({ description: 'Invalid Credential' })
  @UseGuards(AuthGuard('refreshToken'))
  @Post('/restore-access-token')
  async restoreAccessToken(
    @Req() req: Express.Request, //
    @Res() res: Response,
  ) {
    const result = await this.authService.restoreAccessToken(req, res);
    return res.status(201).json({ accessToken: result });
  }
}
