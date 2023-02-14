import Redis from 'ioredis';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { ERROR } from 'src/commons/utils/error.enum';
import { CheckIsValidToken } from 'src/commons/middlewares/check-isValidToken.guard';

import { UserService } from './user.service';
import { CreateUserInput } from './dto/createUser.input';
import { UpdateUserInput } from './dto/updateUser.input';
import { DeleteUserInput } from './dto/deleteUser.input';

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
  @UseGuards(CheckIsValidToken)
  @ApiOperation({
    summary: '회원 정보 조회',
  })
  @Get('/getUserInfo')
  async getUser(
    @Req() req: Express.Request,
    @Res() res: Response, //
  ) {
    const result = await this.userService.getUser(req['header'].id);
    return res.status(HttpStatus.OK).json(result);
  }

  // ========================================================= //
  /** 회원가입하기 */
  @ApiOperation({
    summary: '회원가입하기',
  })
  @ApiBody({
    type: CreateUserInput, //
  })
  @Post('/create')
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

  /** 회원정보 수정 */
  @ApiBearerAuth('access-token or refresh-token')
  @UseGuards(AuthGuard('accessToken'))
  @UseGuards(CheckIsValidToken)
  @ApiOperation({
    summary: '회원정보 수정하기',
  })
  @ApiBody({
    type: UpdateUserInput, //
  })
  @Put('/update')
  async updateUser(
    @Body() input: UpdateUserInput, //
    @Req() req: Express.Request,
    @Res() res: Response,
  ) {
    const accessToken = req['headers'].authorization.replace('Bearer ', '');
    const bl_accessToken = await this.access_token_pool.get(accessToken);

    if (bl_accessToken) {
      throw new ConflictException(ERROR.CAN_NOT_LOGOUT);
    }

    const user = await this.userService.isValidUser(req['user'].id);
    const isBool = await this.userService.updateUser(user.id, input);
    const result =
      isBool === true
        ? ERROR.USER_UPDATE_INFO_SUCCEED
        : ERROR.USER_UPDATE_INFO_FAILED;

    return res.status(HttpStatus.OK).json(result);
  }

  /** 회원탈퇴 */
  @ApiBearerAuth('access-token or refresh-token')
  @UseGuards(AuthGuard('accessToken'))
  @UseGuards(CheckIsValidToken)
  @ApiOperation({
    summary: '회원탈퇴하기',
  })
  @ApiBody({
    type: DeleteUserInput, //
  })
  @Delete('/delete')
  async deleteUser(
    @Body() input: DeleteUserInput, //
    @Req() req: Express.Request,
    @Res() res: Response,
  ) {
    const accessToken = req['headers'].authorization.replace('Bearer ', '');
    const bl_accessToken = await this.access_token_pool.get(accessToken);

    if (bl_accessToken) {
      throw new ConflictException(ERROR.REQUIRED_LOGIN);
    }

    const user = await this.userService.isValidUser(req['user'].id);
    const isBool = await this.userService.deleteUser(
      user.id,
      req['body'].password,
      input,
    );

    const result =
      isBool === true
        ? ERROR.SUCCEED_DELETED_ACCOUNT
        : ERROR.FAILED_DELETED_ACCOUNT;

    return res.status(HttpStatus.OK).json(result);
  }
}
