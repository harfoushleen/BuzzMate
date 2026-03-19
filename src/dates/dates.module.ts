import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './location.entity';
import { SuggestedDate } from './suggested-date.entity';
import { DatesService } from './dates.service';
import { UsersModule } from '../users/users.module';
import { PreferencesModule } from '../preferences/preferences.module';

import { DatesController } from './dates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Location, SuggestedDate]), UsersModule, PreferencesModule],
  providers: [DatesService],
  controllers: [DatesController],
  exports: [TypeOrmModule, DatesService],
})
export class DatesModule {}

