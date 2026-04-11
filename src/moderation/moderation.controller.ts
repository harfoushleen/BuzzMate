import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ModerationService } from './moderation.service';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('block')
  block(
    @Body() body: { blockerId: number; blockedId: number },
  ) {
    return this.moderationService.block(body.blockerId, body.blockedId);
  }

  @Post('report')
  report(
    @Body() body: { reporterId: number; reportedId: number; reason: string },
  ) {
    return this.moderationService.report(
      body.reporterId,
      body.reportedId,
      body.reason,
    );
  }

  @Post('unmatch')
  unmatch(
    @Body() body: { userId: number; otherUserId: number },
  ) {
    return this.moderationService.unmatch(body.userId, body.otherUserId);
  }

  @Get('blocks/:userId')
  getBlockedUsers(@Param('userId', ParseIntPipe) userId: number) {
    return this.moderationService.getBlockedUsers(userId);
  }

  @Post('unblock')
  unblock(
    @Body() body: { blockerId: number; blockedId: number },
  ) {
    return this.moderationService.unblock(body.blockerId, body.blockedId);
  }
}
