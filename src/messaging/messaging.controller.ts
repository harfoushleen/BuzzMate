import { Controller, Get, Param, ParseIntPipe, Post, Body } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) { }

  @Get('conversation/:conversationId/messages')
  listMessages(@Param('conversationId', ParseIntPipe) conversationId: number) {
    return this.messagingService.listMessages(conversationId);
  }

  @Post('conversation/:conversationId/messages')
  sendMessage(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body('senderId', ParseIntPipe) senderId: number,
    @Body('messageBody') messageBody: string,
  ) {
    return this.messagingService.sendMessage(conversationId, senderId, messageBody);
  }
  @Get('user/:userId/conversations')
  getConversationsForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.messagingService.getConversationsForUser(userId);
  }
}

