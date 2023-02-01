import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateUserInput {
  @IsString()
  @MinLength(1, {
    message: 'Your password is too short! It must be 1 characters or more!',
  })
  @ApiProperty({
    example: '12345!@fd',
  })
  password: string;

  @IsString()
  @MinLength(1, {
    message: 'Your nickname is too short! It must be 5 characters or more!',
  })
  @ApiProperty({
    example: '홍길동',
  })
  nickName: string;
}
