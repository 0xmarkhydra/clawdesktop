import {
  WebSocketGateway as NestWebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Server, Socket } from 'socket.io';

const ADMIN_ROOM = 'admin:room'; // Room chung cho tất cả admin online

@NestWebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectPinoLogger(WebSocketGateway.name)
    private readonly logger: PinoLogger,
  ) {}

  handleConnection(client: Socket) {
    this.logger.info({ clientId: client.id }, 'Client connected');
  }

  handleDisconnect(client: Socket) {
    this.logger.info({ clientId: client.id }, 'Client disconnected');
  }

  /** Admin tự join admin room để nhận notifications */
  @SubscribeMessage('join:admin')
  handleJoinAdmin(@ConnectedSocket() client: Socket) {
    client.join(ADMIN_ROOM);
    this.logger.info({ clientId: client.id }, 'Admin joined admin room');
    client.emit('joined:admin', { ok: true });
  }

  @SubscribeMessage('join:thread')
  handleJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const room = `thread:${data.threadId}`;
    client.join(room);
    this.logger.info({ clientId: client.id, threadId: data.threadId }, 'Client joined thread room');
    client.emit('joined:thread', { threadId: data.threadId });
  }

  @SubscribeMessage('leave:thread')
  handleLeaveThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    client.leave(`thread:${data.threadId}`);
  }

  /** Admin typing in compose box → forward typing indicator to user in that thread */
  @SubscribeMessage('admin:typing')
  handleAdminTyping(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    this.server.to(`thread:${data.threadId}`).emit('thread:typing', { threadId: data.threadId });
  }

  /** Emit typing indicator — user thấy "AI đang gõ..." */
  emitTyping(threadId: string) {
    this.server.to(`thread:${threadId}`).emit('thread:typing', { threadId });
  }

  /** Emit từng chunk text streaming */
  emitStreamChunk(threadId: string, chunk: string) {
    this.server.to(`thread:${threadId}`).emit('thread:stream', { threadId, chunk });
  }

  /** Emit khi stream hoàn tất, kèm full message đã lưu */
  emitStreamDone(threadId: string, message: any) {
    this.server.to(`thread:${threadId}`).emit('thread:stream:done', { threadId, message });
  }

  /** Emit khi có lỗi trong quá trình stream */
  emitStreamError(threadId: string, error: string) {
    this.server.to(`thread:${threadId}`).emit('thread:stream:error', { threadId, error });
  }

  /**
   * Emit cho TẤT CẢ admin khi user gửi tin nhắn mới
   * Admin nhận sự kiện này → phát chuông + hiện badge
   */
  emitNewUserMessage(threadId: string, message: any, thread: any) {
    this.server.to(ADMIN_ROOM).emit('admin:new_message', {
      threadId,
      message,
      thread, // bao gồm title, user info để cập nhật thread list
    });
    this.logger.info({ threadId }, 'Emitted admin:new_message to admin room');
  }

  /** Legacy methods */
  emitToBoxRoom(boxId: string, data: any) {
    this.server.emit(`box:${boxId}`, data);
  }

  emitToAllBoxRoom(data: any) {
    this.server.emit(`box:all`, data);
  }
}