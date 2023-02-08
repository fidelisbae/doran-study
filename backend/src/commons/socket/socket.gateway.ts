import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { ERROR } from '../utils/error.enum';

@WebSocketGateway({ transports: ['websocket'] })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,

    @InjectRedis('access_token')
    private readonly access_token_pool: Redis,

    @InjectRedis('rooms')
    private readonly redis_rooms: Redis,

    @InjectRedis('socket_room')
    private readonly redis_socket_room: Redis,
  ) {}
  private logger: Logger = new Logger('SocketGateway');

  @WebSocketServer()
  io: Server;

  afterInit() {
    this.logger.log(`웹소켓 서버 초기화 ✅️`);
  }

  async handleConnection(
    socket: Socket, //
  ) {
    const token = socket.handshake.query.accessToken as string;

    try {
      const isAccessToken = await this.access_token_pool.get(token);

      if (isAccessToken) {
        throw new UnauthorizedException();
      }
      this.logger.log(`🔵️ Client Connected : ${socket.id} 🔵️`);
    } catch (e) {
      this.logger.log(
        `❌️ UnauthorizedException. Can't Connect : ${socket.id} ❌️`,
      );
    }
  }
  handleDisconnect(socket: Socket) {
    this.logger.log(`❌️ Client Disconnected : ${socket.id} ❌️`);
  }

  @SubscribeMessage('createRoom')
  async createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const room = JSON.parse(roomName).roomName;
    const token = socket.handshake.query.accessToken as string;
    const user = await this.jwtService.verifyAsync(token, {
      secret: 'accessKey',
    });

    const isRoomExists = await this.redis_rooms.exists(room);
    if (isRoomExists) {
      return {
        success: false,
        payload: `${room} 방이 이미 존재합니다.`,
      };
    }

    try {
      socket.join(room);
      this.redis_rooms.set(room, user.id); // 채팅방 리스트 저장
      this.redis_socket_room.set(user.id, room); // 채팅방의 호스트 기록
      this.logger.log(`Room ${room} created`);
      socket.emit('✅️ createRoom ✅️ :', room);
      return { success: true, payload: room };
    } catch (e) {
      this.logger.log(`❌️ createRoom Error ❌️`, e);
      socket.emit('createRoom Error', ERROR.CAN_NOT_CREATED_ROOM);
    }
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const room = JSON.parse(roomName).roomName;
    const token = socket.handshake.query.accessToken as string;
    const user = await this.jwtService.verifyAsync(token, {
      secret: 'accessKey',
    });
    const existRoom = await this.redis_rooms.get(room);

    if (!existRoom) {
      return {
        success: false,
        payload: `${room} 방이 존재하지 않습니다. 방이름을 확인해주세요.`,
      };
    }

    try {
      socket.join(room);
      socket.broadcast
        .to(room)
        .emit('message', { message: `${user.nickName}가 입장했습니다.` });
      this.io.to(user.id).emit(user.id, user.nickName);
      return { success: true };
    } catch (e) {
      this.logger.log(`❌️ joinRoom Error ❌️`, e);
      socket.emit('joinRoom Error', ERROR.CAN_NOT_ENTER_ROOM);
    }
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    const room = JSON.parse(roomName).roomName;
    const token = socket.handshake.query.accessToken as string;
    const user = await this.jwtService.verifyAsync(token, {
      secret: 'accessKey',
    });
    const existRoom = await this.redis_rooms.get(room);

    if (!existRoom) {
      return {
        success: false,
        payload: `${room}을 나갈 수 없습니다. 다시 시도해주세요.`,
      };
    }

    socket.leave(roomName);
    socket.broadcast
      .to(roomName)
      .emit('message', { message: `${socket.id}가 나갔습니다.` });

    return { success: true };
  }

  @SubscribeMessage('kickOutUser')
  async kickOutUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() targetUserID: string,
  ) {
    const token = socket.handshake.query.accessToken as string;
    const user = await this.jwtService.verifyAsync(token, {
      secret: 'accessKey',
    });
    const isHost = await this.redis_socket_room.get(user.id);

    if (!isHost) {
      socket.emit('kicOutUser Error', {
        message: ERROR.DO_NOT_HAVE_PERMISSION,
      });
      return {
        success: false,
        payload: '방장만 강퇴할 수 있습니다.',
      };
    }
  }
}
