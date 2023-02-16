import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserInput {
  @IsString()
  @IsOptional()
  @MinLength(5, {
    message: 'Your password is too short! It must be 1 characters or more!',
  })
  @ApiProperty({
    example: '12345!@fd',
  })
  password?: string;

  @IsString()
  @IsOptional()
  @MinLength(5, {
    message: 'Your nickname is too short! It must be 5 characters or more!',
  })
  @ApiProperty({
    example: '홍길동',
  })
  nickName?: string;
}
