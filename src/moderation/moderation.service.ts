import { ForbiddenException, Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './block.entity';
import { Report } from './report.entity';
import { UsersService } from '../users/users.service';
import { DiscoverService } from '../discover/discover.service';
import { MatchesService } from '../matches/matches.service';

@Injectable()
export class ModerationService {
  private readonly BAN_THRESHOLD = 3;

  constructor(
    @InjectRepository(Block)
    private readonly blockRepo: Repository<Block>,
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => DiscoverService))
    private readonly discoverService: DiscoverService,
    @Inject(forwardRef(() => MatchesService))
    private readonly matchesService: MatchesService,
  ) {}

  async block(blockerId: number, blockedId: number): Promise<Block> {
    if (blockerId === blockedId) {
      throw new ForbiddenException('Cannot block yourself');
    }
    const [blocker, blocked] = await Promise.all([
      this.usersService.findOne(blockerId),
      this.usersService.findOne(blockedId),
    ]);

    let block = await this.blockRepo.findOne({
      where: { blockerId, blockedId },
    });
    if (!block) {
      block = this.blockRepo.create({
        blocker,
        blocked,
        blockerId,
        blockedId,
      });
      block = await this.blockRepo.save(block);
    }

    // Unmatch if a match exists between the two users
    await this.matchesService.unmatchBetween(blockerId, blockedId);

    // Invalidate discovery pool cache on block
    this.discoverService.invalidate(blockerId);
    this.discoverService.regenerateForUser(blockerId).catch(() => null);

    return block;
  }

  async report(reporterId: number, reportedId: number, reason: string): Promise<Report> {
    if (reporterId === reportedId) {
      throw new ForbiddenException('Cannot report yourself');
    }
    const [reporter, reported] = await Promise.all([
      this.usersService.findOne(reporterId),
      this.usersService.findOne(reportedId),
    ]);

    let isNewReport = false;
    let report = await this.reportRepo.findOne({
      where: { reporterId, reportedId },
    });
    if (!report) {
      report = this.reportRepo.create({
        reporter,
        reported,
        reporterId,
        reportedId,
        reason,
      });
      report = await this.reportRepo.save(report);
      isNewReport = true;
    }

    if (isNewReport && reported.accountStatus === 'active') {
      reported.reportCount += 1;
      let newStatus = reported.accountStatus;
      
      if (reported.reportCount >= this.BAN_THRESHOLD) {
        newStatus = 'banned' as any;
        this.discoverService.invalidate(reportedId);
      }

      await this.usersService.updateInternal(reportedId, {
        accountStatus: newStatus,
        reportCount: reported.reportCount,
      });
    }

    // Auto-block after reporting (so they vanish from discover/matches/messaging)
    await this.block(reporterId, reportedId);

    return report;
  }

  async unmatch(userId: number, otherUserId: number): Promise<{ success: boolean }> {
    if (userId === otherUserId) {
      throw new ForbiddenException('Cannot unmatch yourself');
    }
    const result = await this.matchesService.unmatchBetween(userId, otherUserId);
    // Invalidate discover cache so future pools are fresh
    this.discoverService.invalidate(userId);
    return { success: !!result };
  }

  async getBlockedUsers(userId: number): Promise<Block[]> {
    return this.blockRepo.find({
      where: { blockerId: userId },
      relations: ['blocked'],
    });
  }

  async unblock(blockerId: number, blockedId: number): Promise<{ success: boolean }> {
    if (blockerId === blockedId) {
      throw new ForbiddenException('Cannot unblock yourself');
    }

    const block = await this.blockRepo.findOne({
      where: { blockerId, blockedId },
    });
    if (!block) {
      return { success: false };
    }

    // Remove the block
    await this.blockRepo.remove(block);

    // Check if the other user has also blocked this user
    const reciprocalBlock = await this.blockRepo.findOne({
      where: { blockerId: blockedId, blockedId: blockerId },
    });

    if (!reciprocalBlock) {
      // Re-activate any unmatched match between them only if no blocks remain
      await this.matchesService.rematchBetween(blockerId, blockedId);
    }

    // Invalidate discover cache
    this.discoverService.invalidate(blockerId);

    return { success: true };
  }

}
