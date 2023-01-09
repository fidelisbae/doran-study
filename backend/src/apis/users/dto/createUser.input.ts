import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { UserEntity } from '../entities/user.entity';

export class CreateUserInput {
  @IsString()
  @MinLength(1, {
    message: 'ID는 최소 1글자 이상이여야 합니다.',
  })
  @ApiProperty({
    example: 'user123',
  })
  id: string;

  @IsString()
  @MinLength(1, {
    message: '비밀번호는 최소 1글자 이상이여야 합니다.',
  })
  @ApiProperty({
    example: '12345!@fd',
  })
  password: string;

  @IsString()
  @MinLength(1, {
    message: '닉네임은 최소 1글자 이상이여야 합니다.',
  })
  @ApiProperty({
    example: '홍길동',
  })
  nickName: string;
}
