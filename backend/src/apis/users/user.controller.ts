import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserInput } from './dto/createUser.input';

@ApiTags('Users')
@Controller('/users')
export class UserController {
  constructor(
    private readonly userService: UserService, //
  ) {}

  @ApiBearerAuth('access-token or refresh-token')
  @UseGuards(AuthGuard('accessToken'))
  @ApiUnauthorizedResponse({ description: 'Invalid Credential' })
  // @ApiQuery({
  //   type: CreateUserInput, //
  // })
  @ApiParam({ name: 'user_id' })
  // uri에 함수이름을 쓰는게 아님 uri가 /users 면 post, get, delete, put 으로 crud 구분가능
  // @Get('/getUser')
  // path param 으로 user_id를 받도록 수정했음
  @Get('/:user_id')
  // 전체 유저가 아니라 특정 유저를 조회할거면 getUsers => getUser 로 수정하도록
  async getUsers(
    @Req() req: Express.Request,
    // @Query() user_id: CreateUserInput,
    @Param('user_id') userId: string,
  ) {
    // console.log('req', req);
    console.log(userId);
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
