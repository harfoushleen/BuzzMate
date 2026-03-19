import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Controller('messages')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversation/:conversationId')
  listMessages(@Param('conversationId', ParseIntPipe) conversationId: number) {
    return this.messagingService.listMessages(conversationId);
  }
}

