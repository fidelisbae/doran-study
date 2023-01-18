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
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ transports: ['websocket'] })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor() {}
  private logger: Logger = new Logger('SocketGateway');

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    this.logger.log(`Client Connected : ${socket.id}`);
  }
  handleDisconnect(socket: Socket) {
    this.logger.log(`Client Disconnected : ${socket.id}`);
  }

  @SubscribeMessage('ClientToServer')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data, //
  ) {
    this.server.emit('ServerToClient', data);
  }
}
