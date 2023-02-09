import { IsString } from 'class-validator';

export class KickUserDto {
  @IsString()
  roomName: string;

  @IsString()
  targetUser: string;
}
