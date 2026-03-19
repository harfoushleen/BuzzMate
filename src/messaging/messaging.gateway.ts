import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagingService } from './messaging.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly messagingService: MessagingService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string | undefined;
    if (userId) {
      client.join(`user:${userId}`);
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @MessageBody() payload: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    if (payload.conversationId) {
      client.join(`conversation:${payload.conversationId}`);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody()
    payload: { conversationId: number; senderId: number; body: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagingService.sendMessage(
      payload.conversationId,
      payload.senderId,
      payload.body,
    );

    this.server.to(`conversation:${payload.conversationId}`).emit('new_message', message);
    this.server.to(`user:${payload.senderId}`).emit('message_sent', message);
    client.emit('message_ack', { messageId: message.messageId });
  }
}

