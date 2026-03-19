import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './block.entity';
import { Report } from './report.entity';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';
import { UsersModule } from '../users/users.module';
import { DiscoverModule } from '../discover/discover.module';

@Module({
  imports: [TypeOrmModule.forFeature([Block, Report]), UsersModule, forwardRef(() => DiscoverModule)],
  providers: [ModerationService],
  controllers: [ModerationController],
  exports: [ModerationService],
})
export class ModerationModule {}

