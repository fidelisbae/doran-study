import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateUserInput {
  @IsString()
  @MinLength(5, {
    message: 'Your id is too short! It must be 5 characters or more!',
  })
  @ApiProperty({
    example: 'user123',
  })
  id: string;

  @IsString()
  @MinLength(8, {
    message: 'Your password is too short! It must be 1 characters or more!',
  })
  @ApiProperty({
    example: '12345!@fd',
  })
  password: string;

  @IsString()
  @MinLength(5, {
    message: 'Your nickname is too short! It must be 5 characters or more!',
  })
  @ApiProperty({
    example: '홍길동',
  })
  nickName: string;
}
