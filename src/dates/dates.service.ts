import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuggestedDate } from './suggested-date.entity';
import { Location } from './location.entity';
import { UsersService } from '../users/users.service';
import { PreferencesService } from '../preferences/preferences.service';
import { google } from 'googleapis';
import { Match } from '../matches/match.entity';

@Injectable()
export class DatesService {
  private readonly logger = new Logger(DatesService.name);

  constructor(
    @InjectRepository(SuggestedDate)
    private readonly suggestedDateRepo: Repository<SuggestedDate>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    private readonly usersService: UsersService,
    private readonly preferencesService: PreferencesService,
  ) {}

  async suggestDateForMatch(match: Match): Promise<SuggestedDate | null> {
    try {
      const user1 = await this.usersService.findOne(match.user1Id);
      const user2 = await this.usersService.findOne(match.user2Id);

      const pref1 = await this.preferencesService.getForUser(match.user1Id).catch(() => null);
      const pref2 = await this.preferencesService.getForUser(match.user2Id).catch(() => null);

      // Simple preference matching logic (Location category)
      let preferredCategory: string | undefined;
      if (pref1?.dateMood && pref2?.dateMood && pref1.dateMood === pref2.dateMood && pref1.dateMood !== 'unsure') {
        preferredCategory = pref1.dateMood;
      }

      // Resolve location based on mutually preferred mood, or random Location
      const query = this.locationRepo.createQueryBuilder('location');
      if (preferredCategory) {
        query.where('location.category = :category', { category: preferredCategory });
      }
      query.orderBy('RAND()').limit(1);
      
      let location = await query.getOne();
      if (!location) {
        // Fallback to any location
        location = await this.locationRepo.createQueryBuilder('location').orderBy('RAND()').limit(1).getOne();
      }

      if (!location) {
        this.logger.warn('No locations available in the database.');
        return null; // DB might be empty
      }

      // Check Google Calendar API for mutually available slots
      const hasCalendarOverlaps = await this.checkCalendarAvailability(
        user1.email,
        user1.googleRefreshToken,
        user2.email,
        user2.googleRefreshToken
      );

      if (!hasCalendarOverlaps) {
        this.logger.warn(`Could not find mutual availability for Match ${match.matchId}, but proposing date anyway.`);
        // In reality we might schedule something async, but here we just proceed to propose
      }

      // Generate suggested date
      const suggestedDate = this.suggestedDateRepo.create({
        match,
        location,
        status: 'suggested'
      });

      return await this.suggestedDateRepo.save(suggestedDate);

    } catch (error) {
      this.logger.error(`Failed to suggest date for match ${match.matchId}`, error);
      return null;
    }
  }

  async acceptDate(suggestionId: number, userId: number): Promise<SuggestedDate> {
    const suggestion = await this.suggestedDateRepo.findOne({
      where: { suggestionId },
      relations: ['match'],
    });

    if (!suggestion) throw new Error('Suggested date not found');

    const match = suggestion.match;
    const isUser1 = match.user1Id === userId;
    const isUser2 = match.user2Id === userId;

    if (!isUser1 && !isUser2) throw new Error('User not part of this match');

    if (suggestion.status === 'accepted_by_both') {
      return suggestion; // Already accepted
    }

    if (suggestion.status === 'suggested') {
      suggestion.status = isUser1 ? 'accepted_by_user_1' : 'accepted_by_user_2';
    } else if (suggestion.status === 'accepted_by_user_1') {
      if (isUser2) suggestion.status = 'accepted_by_both';
    } else if (suggestion.status === 'accepted_by_user_2') {
      if (isUser1) suggestion.status = 'accepted_by_both';
    }

    return await this.suggestedDateRepo.save(suggestion);
  }

  private async checkCalendarAvailability(user1Email: string, token1?: string, user2Email?: string, token2?: string): Promise<boolean> {
    if (!token1 || !token2 || !user2Email) {
      this.logger.debug('One or both users missing Google Calendar tokens, skipping check.');
      return false; 
    }
    
    try {
      // Execute the python script to fetch availabilities and schedule event
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const path = require('path');
      const execAsync = promisify(exec);

      const isDist = __dirname.includes('dist');
      const baseDir = isDist ? path.join(__dirname, '..', '..') : path.join(__dirname, '..', '..', 'src');
      
      const scriptPath = path.join(baseDir, 'PythonBackend', 'calendar_script.py');
      const credsPath = path.join(baseDir, 'PythonBackend', 'credentials.json');

      const { stdout } = await execAsync(`python "${scriptPath}" "${credsPath}" "${user1Email}" "${token1}" "${user2Email}" "${token2}"`);
      
      const result = JSON.parse(stdout.trim());
      if (result.status === 'success') {
        this.logger.log(`Successfully booked date slot from ${result.start} to ${result.end}. Event Link: ${result.eventLink}`);
        return true;
      } else {
        this.logger.warn(`Python calendar script returned error: ${result.error}`);
        return false;
      }
    } catch (e: any) {
      this.logger.error(`Failed to execute python calendar script: ${e.message}`);
      return false;
    }
  }
}
