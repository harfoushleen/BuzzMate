import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interaction } from './interaction.entity';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';
import { UsersModule } from '../users/users.module';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [TypeOrmModule.forFeature([Interaction]), UsersModule, MatchesModule],
  providers: [InteractionsService],
  controllers: [InteractionsController],
})
export class InteractionsModule {}

