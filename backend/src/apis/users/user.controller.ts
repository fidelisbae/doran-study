import Redis from 'ioredis';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { CreateUserInput } from './dto/createUser.input';

@ApiTags('Users')
@Controller('/users')
export class UserController {
  constructor(
    private readonly userService: UserService, //

    @InjectRedis('access_token')
    private readonly access_token_pool: Redis,
  ) {}

  @ApiBearerAuth('access-token or refresh-token')
  @UseGuards(AuthGuard('accessToken'))
  @ApiUnauthorizedResponse({ description: 'Invalid Credential' })
  @ApiParam({
    name: 'user_id',
  })
  @Get('/:user_id')
  async getUsers(
    @Req() req: Express.Request,
    @Param('user_id') user_id: string,
  ) {
    const accessToken = req['headers'].authorization.replace('Bearer ', '');
    const bl_accessToken = await this.access_token_pool.get(accessToken);

    if (bl_accessToken) {
      throw new ConflictException('로그인을 먼저 해주세요.');
    }

    return '성공!!';
  }

  // ========================================================= //
  /** 회원가입하기 */
  @ApiOperation({
    summary: '회원가입하기',
  })
  @ApiBody({
    type: CreateUserInput, //
  })
  @Post('/createUser')
  async createUser(
    @Body() input: CreateUserInput, //
    @Res() res: Response,
  ) {
    await this.userService.checkInfo(input.id, input.nickName);
    await this.userService.checkValidatePwd(input.password);

    const result = await this.userService.createUser(input);
    const { deletedAt, createdAt, updatedAt, password, ...output } = result;

    return res.status(HttpStatus.CREATED).json(output);
  }
}
