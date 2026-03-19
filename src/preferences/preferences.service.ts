import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preference } from './preference.entity';
import { UpsertPreferenceDto } from './dto/upsert-preference.dto';
import { UsersService } from '../users/users.service';
import { DiscoverService } from '../discover/discover.service';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(Preference)
    private readonly prefRepo: Repository<Preference>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => DiscoverService))
    private readonly discoverService: DiscoverService,
  ) {}

  async getForUser(userId: number): Promise<Preference> {
    const pref = await this.prefRepo.findOne({
      where: { user: { userId } },
      relations: ['user'],
    });
    if (!pref) {
      throw new NotFoundException('Preferences not found');
    }
    return pref;
  }

  async upsert(userId: number, dto: UpsertPreferenceDto): Promise<Preference> {
    const user = await this.usersService.findOne(userId);
    let pref = await this.prefRepo.findOne({
      where: { user: { userId } },
      relations: ['user'],
    });

    if (!pref) {
      pref = this.prefRepo.create({
        user,
        ...dto,
      });
    } else {
      Object.assign(pref, dto);
    }

    const saved = await this.prefRepo.save(pref);

    // Invalidate discovery pool cache on preference change
    this.discoverService.invalidate(userId);
    this.discoverService.regenerateForUser(userId).catch(() => null);

    return saved;
  }
}

