import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';
import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AuthGuard } from '@nestjs/passport';

@WebSocketGateway({ transports: ['websocket'] })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,

    @InjectRedis('rooms')
    private readonly redis_rooms: Redis,

    @InjectRedis('socket_room')
    private readonly redis_socket_room: Redis,
  ) {}

  rooms: string[] = [];
  private logger: Logger = new Logger('SocketGateway');

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log(`웹소켓 서버 초기화 ✅️`);
  }

  handleConnection(
    socket: Socket, //
  ) {
    const token = socket.handshake.query.accessToken as string;

    try {
      this.logger.log(`🔵️ Client Connected : ${socket.id} 🔵️`);
      return this.jwtService.verify(token, { secret: 'accessKey' });
    } catch (e) {
      this.logger.log(`❌️ Client Disconnected : ${socket.id} ❌️`);
      throw new UnauthorizedException();
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
    console.log(socket);
    const isRoomExists = await this.redis_rooms.exists(roomName);
    if (isRoomExists) {
      return {
        success: false,
        payload: `${roomName} 방이 이미 존재합니다.`,
      };
    }

    socket.join(roomName);
    this.redis_rooms.set(roomName, 'userID');
    this.server.emit('createRoom', roomName);
    this.logger.log(`Room ${roomName} created`);
    return { success: true, payload: roomName };
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    let loginUser;
    if (loginUser === undefined) {
      socket.emit('joinRoom Error');
    }
    if (!this.rooms.includes(roomName)) {
      return {
        success: false,
        payload: `${roomName} 방이 존재하지 않습니다. 방이름을 확인해주세요.`,
      };
    }

    socket.join(roomName);
    socket.broadcast
      .to(roomName)
      .emit('message', { message: `${socket.id}가 입장했습니다.` });

    return { success: true };
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    socket.leave(roomName);
    socket.broadcast
      .to(roomName)
      .emit('message', { message: `${socket.id}가 나갔습니다.` });

    return { success: true };
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: string, //
  ) {
    socket.broadcast.emit('message', { username: socket.id, message });
    return { username: socket.id, message };
  }
}
