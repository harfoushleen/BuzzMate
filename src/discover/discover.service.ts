import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import LRUCache from 'lru-cache';
import { DiscoverSuggestion } from './discover-suggestion.entity';
import { UsersService } from '../users/users.service';
import { Preference } from '../preferences/preference.entity';
import { User } from '../users/user.entity';
import { Interaction } from '../interactions/interaction.entity';
import { Block } from '../moderation/block.entity';
import { Match } from '../matches/match.entity';

@Injectable()
export class DiscoverService {
  private cache = new LRUCache<number, DiscoverSuggestion | null>({
    max: 1000,
    ttl: 7 * 24 * 60 * 60 * 1000,
  });

  constructor(
    @InjectRepository(DiscoverSuggestion)
    private readonly suggestionRepo: Repository<DiscoverSuggestion>,
    private readonly usersService: UsersService,
    @InjectRepository(Preference)
    private readonly prefRepo: Repository<Preference>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Interaction)
    private readonly interactionRepo: Repository<Interaction>,
    @InjectRepository(Block)
    private readonly blockRepo: Repository<Block>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
  ) {}

  async getSuggestionsForUser(userId: number): Promise<DiscoverSuggestion | null> {
    const cached = this.cache.get(userId);
    if (cached !== undefined) {
      return cached;
    }

    const suggestion = await this.suggestionRepo.findOne({
      where: { user: { userId } },
      relations: ['user'],
    });

    this.cache.set(userId, suggestion ?? null);
    return suggestion;
  }

  /** Hydrate candidate IDs into full User objects with their preferences (opener). */
  async getCandidateProfiles(userId: number): Promise<{ candidates: User[], expiresAt: Date | null }> {
    const suggestion = await this.getSuggestionsForUser(userId);
    if (!suggestion || !suggestion.candidateIds || suggestion.candidateIds.length === 0) {
      return { candidates: [], expiresAt: suggestion?.expiresAt || null };
    }

    // Get IDs of users already actively matched with this user
    const activeMatches = await this.matchRepo.find({
      where: [
        { user1Id: userId, status: 'active' },
        { user2Id: userId, status: 'active' },
      ],
    });
    const matchedIds = new Set(activeMatches.map(m =>
      m.user1Id === userId ? m.user2Id : m.user1Id
    ));

    const users = await this.userRepo.find({
      where: { userId: In(suggestion.candidateIds), accountStatus: 'active' },
    });

    // Attach each user's preference (for opener display)
    const prefs = await this.prefRepo.find({
      where: { user: { userId: In(suggestion.candidateIds) } },
      relations: ['user'],
    });
    const prefMap = new Map(prefs.map((p) => [p.user.userId, p]));

    const candidates = users
      .filter((u) => !matchedIds.has(u.userId))
      .map((u) => {
        (u as any).preferences = prefMap.get(u.userId) || null;
        return u;
      });

    return { candidates, expiresAt: suggestion.expiresAt };
  }

  async regenerateForUser(userId: number): Promise<DiscoverSuggestion | null> {
    const user = await this.usersService.findOne(userId);
    const pref = await this.prefRepo.findOne({
      where: { user: { userId } },
      relations: ['user'],
    });

    if (!pref) {
      return null;
    }

    const qb = this.userRepo.createQueryBuilder('u');
    qb.where('u.user_id <> :userId', { userId })
      .andWhere('u.account_status = :status', { status: 'active' })
      .andWhere('u.age BETWEEN :minAge AND :maxAge', {
        minAge: pref.minAge,
        maxAge: pref.maxAge,
      });

    // Apply preferred gender filter
    if (pref.preferredGender !== 'any') {
      qb.andWhere('u.gender = :gender', { gender: pref.preferredGender });
    }

    // Exclude users already interacted with (liked/disliked)
    const interactedSub = this.interactionRepo
      .createQueryBuilder('i')
      .select('i.receiver_id')
      .where('i.sender_id = :userId', { userId });
    qb.andWhere(`u.user_id NOT IN (${interactedSub.getQuery()})`);

    // Exclude users who blocked the current user or that the current user blocked
    const blockedBySub = this.blockRepo
      .createQueryBuilder('b1')
      .select('b1.blocker_id')
      .where('b1.blocked_id = :userId', { userId });
    qb.andWhere(`u.user_id NOT IN (${blockedBySub.getQuery()})`);

    const blockedSub = this.blockRepo
      .createQueryBuilder('b2')
      .select('b2.blocked_id')
      .where('b2.blocker_id = :userId', { userId });
    qb.andWhere(`u.user_id NOT IN (${blockedSub.getQuery()})`);

    // Exclude users already actively matched with the current user
    const matchedAsUser1Sub = this.matchRepo
      .createQueryBuilder('m1')
      .select('m1.user_2_id')
      .where('m1.user_1_id = :userId', { userId })
      .andWhere(`m1.status = 'active'`);
    qb.andWhere(`u.user_id NOT IN (${matchedAsUser1Sub.getQuery()})`);

    const matchedAsUser2Sub = this.matchRepo
      .createQueryBuilder('m2')
      .select('m2.user_1_id')
      .where('m2.user_2_id = :userId', { userId })
      .andWhere(`m2.status = 'active'`);
    qb.andWhere(`u.user_id NOT IN (${matchedAsUser2Sub.getQuery()})`);

    qb.setParameters(interactedSub.getParameters());
    qb.setParameters(blockedBySub.getParameters());
    qb.setParameters(blockedSub.getParameters());
    qb.setParameters(matchedAsUser1Sub.getParameters());
    qb.setParameters(matchedAsUser2Sub.getParameters());

    qb.limit(30);

    const candidates = await qb.getMany();
    const candidateIds = candidates
      .slice(0, 7)
      .map((c) => c.userId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    let suggestion = await this.suggestionRepo.findOne({
      where: { user: { userId } },
      relations: ['user'],
    });

    if (!suggestion) {
      suggestion = this.suggestionRepo.create({
        user,
        candidateIds,
        expiresAt,
      });
    } else {
      suggestion.candidateIds = candidateIds;
      suggestion.expiresAt = expiresAt;
    }

    const saved = await this.suggestionRepo.save(suggestion);
    this.cache.set(userId, saved);
    return saved;
  }

  invalidate(userId: number) {
    this.cache.delete(userId);
  }
}
