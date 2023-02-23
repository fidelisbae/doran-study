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

import { ERROR } from 'src/commons/messages/message.enum';
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
  ) {}

  @ApiBearerAuth('access-token or refresh-token')
  @UseGuards(AuthGuard('accessToken'))
  @UseGuards(CheckIsValidToken)
  @Get('/info')
  async getUserById(
    @Req() req: Express.Request,
    @Res() res: Response, //
  ) {
    const result = await this.userService.getUserById(req['user'].id);
    return res.status(HttpStatus.OK).json(result);
  }

  /** 회원가입하기 */
  @ApiBody({ type: CreateUserInput })
  @Post()
  async createUser(
    @Body() input: CreateUserInput, //
    @Res() res: Response,
  ) {
    const result = await this.userService.createUser(input);
    return res.status(HttpStatus.CREATED).json(result);
  }

  /** 회원정보 수정 */
  @ApiBearerAuth('access-token or refresh-token')
  @UseGuards(AuthGuard('accessToken'))
  @UseGuards(CheckIsValidToken)
  @ApiBody({ type: UpdateUserInput })
  @Put()
  async updateUser(
    @Body() input: UpdateUserInput, //
    @Req() req: Express.Request,
    @Res() res: Response,
  ) {
    const result = await this.userService.updateUser(req['user'].id, input);
    return res.status(HttpStatus.OK).json(result);
  }

  /** 회원탈퇴 */
  @ApiBearerAuth('access-token or refresh-token')
  @UseGuards(AuthGuard('accessToken'))
  @UseGuards(CheckIsValidToken)
  @ApiBody({ type: DeleteUserInput })
  @Delete()
  async deleteUser(
    @Body() input: DeleteUserInput, //
    @Req() req: Express.Request,
    @Res() res: Response,
  ) {
    const result = await this.userService.deleteUser(
      req['user'].id,
      req['body'].password,
      input,
    );
    return res.status(HttpStatus.OK).json(result);
  }
}
