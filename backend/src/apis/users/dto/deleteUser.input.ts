import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteUserInput {
  @IsString()
  @ApiProperty({
    example: 'user123',
  })
  id: string;

  @IsString()
  @ApiProperty({
    example: '12345!@fd',
  })
  password: string;
}
