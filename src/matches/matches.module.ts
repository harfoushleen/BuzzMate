import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { UsersModule } from '../users/users.module';
import { Conversation } from '../messaging/conversation.entity';
import { DatesModule } from '../dates/dates.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Conversation]), UsersModule, DatesModule],
  providers: [MatchesService],
  controllers: [MatchesController],
  exports: [MatchesService],
})
export class MatchesModule {}

