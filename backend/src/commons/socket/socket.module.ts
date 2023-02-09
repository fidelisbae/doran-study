import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatModule } from 'src/apis/chat/chat.module';
import { ChatEntity } from 'src/apis/chat/entities/chat.entity';
import { ChatService } from 'src/apis/chat/chat.service';

import { SocketGateway } from './socket.gateway';

@Module({
  imports: [
    JwtModule.register({}), //
    TypeOrmModule.forFeature([
      ChatEntity, //
    ]),
    ChatModule,
  ], //
  providers: [SocketGateway, ChatService],
  exports: [SocketGateway],
})
export class SocketModule {}
