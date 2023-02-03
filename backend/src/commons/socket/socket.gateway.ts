import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';

@WebSocketGateway({ transports: ['websocket'] })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor() {}

  rooms: string[] = [];

  private logger: Logger = new Logger('SocketGateway');

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log(`웹소켓 서버 초기화 ✅️`);
  }

  handleConnection(socket: Socket) {
    this.logger.log(`🔵️ Client Connected : ${socket.id} 🔵️`);
  }
  handleDisconnect(socket: Socket) {
    this.logger.log(`❌️ Client Disconnected : ${socket.id} ❌️`);
  }

  @SubscribeMessage('createRoom')
  async createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
    if (this.rooms.includes(roomName)) {
      return {
        success: false,
        payload: `${roomName} 방이 이미 존재합니다.`,
      };
    }

    socket.join(roomName);
    this.rooms.push(roomName);
    this.server.emit('createRoom', roomName);
    this.logger.log(`Room ${roomName} created`);
    return { success: true, payload: roomName };
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string,
  ) {
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
