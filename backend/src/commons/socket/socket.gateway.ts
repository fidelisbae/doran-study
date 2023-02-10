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
import { ChatInput } from 'src/apis/chat/dto/chat.dto';
import { ChatService } from 'src/apis/chat/chat.service';

import { KickUserDto } from './dto/socket.dto';

@WebSocketGateway({ transports: ['websocket'] })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,

    @InjectRedis('access_token')
    private readonly access_token_pool: Redis,

    @InjectRedis('rooms')
    private readonly redis_rooms: Redis,

    @InjectRedis('BannedUsers')
    private readonly redis_banned_users: Redis,
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
    const token = socket.handshake.headers.accesstoken as string;

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

  /** 방 생성하기 */
  @SubscribeMessage('createRoom')
  async createRoom(
    @ConnectedSocket() socket: Socket, //
    @MessageBody() input: any,
  ) {
    console.log('socketID', socket.id);
    const room = input['roomName'];
    const token = socket.handshake.headers.accesstoken as string;
    console.log(socket.handshake.headers);
    const user = await this.jwtService.verifyAsync(token, {
      secret: 'accessKey',
    });

    const isRoomExists = await this.redis_rooms.exists(room);
    if (isRoomExists) {
      this.logger.log(`❌️ Room already exists ❌️`);
      this.io.to(socket.id).emit('createRoom_Error', {
        isSuccess: false,
        message: ERROR.ROOM_ALREADY_EXISTS,
        roomName: room,
      });

      return;
    }

    try {
      socket.join(room);
      this.redis_rooms.set(room, user.id);
      this.chatService.saveRoomInfo(user.id, room, user.id);
      this.logger.log(`🚪 Room ${room} has been created.`);
      socket.emit('created-Room', {
        isSuccess: true,
        message: ERROR.SUCCESS_CREATED_ROOM,
        roomName: room,
      });
      this.io.emit('Success', `🚪 Room ${room} has been created.`);
    } catch (e) {
      this.logger.log(`❌️ CreateRoom: ${e} ❌️`);
      socket.emit('createRoom_Error', ERROR.CAN_NOT_CREATED_ROOM);
    }
  }

  /** 방 참여 하기 */
  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() socket: Socket, //
    @MessageBody() input: any,
  ) {
    let memArr = [];
    const room = input['roomName'];
    const token = socket.handshake.headers.accesstoken as string;
    const user = await this.jwtService.verifyAsync(token, {
      secret: 'accessKey',
    });
    const existRoom = await this.redis_rooms.get(room);
    const roomMembers = await this.chatService.getRoom(room);

    if (!existRoom) {
      this.logger.log(`❌️ Room does not exist ❌️`);
      this.io.to(socket.id).emit('joinRoom_Error', {
        isSuccess: false,
        message: ERROR.DOES_NOT_EXIST_ROOM,
        roomName: room,
      });

      return;
    }

    try {
      socket.join(room);

      memArr.push(...roomMembers.users, user.id);
      this.chatService.updateRoomInfo(memArr, room, user.id);

      socket.broadcast
        .to(room)
        .emit('message', { message: `${user.nickName}가 입장했습니다.` });
      this.io.to(socket.id).emit('Success', {
        isSuccess: true,
        message: ERROR.SUCCESS_JOIN_ROOM,
        roomName: room,
      });
    } catch (e) {
      this.logger.log(`❌️ JoinRoom: ${e} ❌️`);
      socket.emit('joinRoom_Error', ERROR.CAN_NOT_ENTER_ROOM);
    }
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    @ConnectedSocket() socket: Socket, //
    @MessageBody() input: any,
  ) {
    const room = input['roomName'];
    const token = socket.handshake.headers.accesstoken as string;
    const user = await this.jwtService.verifyAsync(token, {
      secret: 'accessKey',
    });
    const existRoom = await this.redis_rooms.get(room);

    if (!existRoom) {
      this.logger.log(`❌️ Room does not exist ❌️`);
      this.io.to(socket.id).emit('joinRoom_Error', {
        isSuccess: false,
        message: ERROR.DOES_NOT_EXIST_ROOM,
        roomName: room,
      });

      return;
    }

    const isHost = await this.chatService.getHost(user.id, room);
    try {
      if (!isHost) {
        socket.leave(room);
        socket.broadcast
          .to(room)
          .emit('message', { message: `${user.nickName}이/가 나갔습니다.` });
        this.logger.log(`🚪 ${user.nickName}(${socket.id}) left room ${room}`);
      } else {
        socket.leave(room);
        socket.broadcast.to(room).emit('message', {
          message: '방장이 방을 나가 방이 삭제되었습니다.',
        });
        this.redis_rooms.del(room);
        this.logger.log(`The room "${room}" ${socket.id} has been deleted.`);
      }
    } catch (e) {
      this.logger.log(`❌️ LeaveRoom: ${e} ❌️`);
      socket.emit('leaveRoom_Error', ERROR.FAILED);
    }
  }

  /** 메세지 보내기 */
  @SubscribeMessage('message')
  async sendMessage(
    @ConnectedSocket() socket: Socket, //
    @MessageBody() input: ChatInput,
  ) {
    const room = input['roomName'];
    const token = socket.handshake.headers.accesstoken as string;
    const user = await this.jwtService.verifyAsync(token, {
      secret: 'accessKey',
    });

    try {
      this.io.to(room).emit('receiveMessage', {
        id: socket.id,
        nickName: user.nickName,
        message: input.contents,
      });
    } catch (e) {
      this.logger.log(`❌️ SendMessage: ${e} ❌️`);
      socket.emit('sendMessage_Error', ERROR.FAILED);
    }
  }

  /** 유저 강퇴하기 */
  @SubscribeMessage('kickOutUser')
  async kickOutUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() input: KickUserDto,
  ) {
    const room = input['roomName'];
    const token = socket.handshake.headers.accesstoken as string;
    const user = await this.jwtService.verifyAsync(token, {
      secret: 'accessKey',
    });
    const isHost = await this.chatService.getHost(user.id, input.roomName);

    if (!isHost) {
      socket.emit('kicOutUser Error', {
        isSuccess: false,
        message: ERROR.DO_NOT_HAVE_PERMISSION,
      });

      return;
    }

    const isExistUser = await this.chatService.getUser(room);
    const targetUser = await this.chatService.getRoomMembers(
      room,
      input.targetUserID,
    );

    if (!targetUser) {
      socket.emit('kicOutUser Error', {
        isSuccess: false,
        message: ERROR.DOES_NOT_EXIST_USER,
        roomName: room,
      });
      return;
    }

    const userList = isExistUser.users.filter(
      (element) => element !== input.targetUserID,
    );

    try {
      await this.chatService.updateRoomInfo(userList, room);
      this.io.to(room).emit('message', {
        message: `${input.targetUserID}이/가 강퇴되었습니다.`,
      });
      this.logger.log(
        `${input.targetUserID} is kicked out of the room ${room}`,
      );
    } catch (e) {
      this.logger.log(`❌️ KickOutUser: ${e} ❌️`);
      socket.emit('kickOutUser', ERROR.FAILED);
    }
  }
}
