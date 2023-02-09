import { IsString } from 'class-validator';

export class ChatDTO {
  @IsString()
  host: string;

  @IsString()
  roomName: string;
}
