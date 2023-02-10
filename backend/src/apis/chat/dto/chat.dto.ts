import { IsString } from 'class-validator';

export class ChatInput {
  @IsString()
  roomName: string;

  @IsString()
  contents: string;
}
