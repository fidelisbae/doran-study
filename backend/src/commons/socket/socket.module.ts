import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatModule } from 'src/apis/chat/chat.module';
import { ChatEntity } from 'src/apis/chat/entities/chat.entity';

import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';

@Module({
  imports: [
    JwtModule.register({}), //
    TypeOrmModule.forFeature([
      ChatEntity, //
    ]),
    ChatModule,
  ], //
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway],
})
export class SocketModule {}
