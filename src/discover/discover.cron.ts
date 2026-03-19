import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { DiscoverService } from './discover.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class DiscoverCron implements OnModuleInit {
  private readonly logger = new Logger(DiscoverCron.name);

  constructor(
    private readonly discoverService: DiscoverService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  onModuleInit() {
    // Run weekly on Sunday at midnight
    cron.schedule('0 0 * * 0', async () => {
      this.logger.log('Starting weekly Discover Suggestions generation');
      await this.runBatch();
      this.logger.log('Completed weekly Discover Suggestions generation');
    });
  }

  async runBatch() {
    try {
      // In a real app we would paginate
      const users = await this.userRepo.find({
        where: { accountStatus: 'active' },
      });

      // Regenerate for each user
      for (const user of users) {
        try {
          await this.discoverService.regenerateForUser(user.userId);
        } catch (error) {
          this.logger.error(`Failed to regenerate for user ${user.userId}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to run discover suggestions batch', error);
    }
  }
}
