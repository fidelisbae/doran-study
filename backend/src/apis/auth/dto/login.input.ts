import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AuthInput {
  @IsString()
  @MinLength(5, {
    message: 'Your id is wrong! please check your id.',
  })
  @ApiProperty({
    example: 'user123',
  })
  id: string;

  @IsString()
  @MinLength(8, {
    message: 'Your password is wrong! please check your password',
  })
  @ApiProperty({
    example: '12345!@fd',
  })
  password: string;
}
