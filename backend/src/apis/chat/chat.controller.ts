import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';

import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('/chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService, //
  ) {}
}
