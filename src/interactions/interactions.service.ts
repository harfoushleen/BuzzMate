import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaction } from './interaction.entity';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UsersService } from '../users/users.service';
import { MatchesService } from '../matches/matches.service';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Interaction)
    private readonly interactionRepo: Repository<Interaction>,
    private readonly usersService: UsersService,
    private readonly matchesService: MatchesService,
  ) {}

  async recordInteraction(dto: CreateInteractionDto) {
    const [sender, receiver] = await Promise.all([
      this.usersService.findOne(dto.senderId),
      this.usersService.findOne(dto.receiverId),
    ]);

    const interaction = this.interactionRepo.create({
      sender,
      receiver,
      actionType: dto.actionType,
      senderId: dto.senderId,
      receiverId: dto.receiverId,
    });
    await this.interactionRepo.save(interaction);

    if (dto.actionType === 'like') {
      const mutual = await this.interactionRepo.findOne({
        where: {
          senderId: dto.receiverId,
          receiverId: dto.senderId,
          actionType: 'like',
        },
      });
      if (mutual) {
        await this.matchesService.createMutualMatch(dto.senderId, dto.receiverId);
      }
    }

    return interaction;
  }
}

