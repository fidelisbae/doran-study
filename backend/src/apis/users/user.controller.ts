import { Response } from 'express';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserInput } from './dto/createUser.input';

@ApiTags('Users')
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService, //
  ) {}

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
    const result = await this.userService.createUser(input);
    const { deletedAt, createdAt, updatedAt, ...other } = result;

    res.status(HttpStatus.CREATED).send(other);
    return other;
  }
}
