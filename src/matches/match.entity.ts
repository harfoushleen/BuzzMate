import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Conversation } from '../messaging/conversation.entity';

@Entity({ name: 'Matches' })
@Unique('unique_match', ['user1', 'user2'])
export class Match {
  @PrimaryGeneratedColumn({ name: 'match_id' })
  matchId!: number;

  @ManyToOne(() => User, (user) => user.matchesAsUser1, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_1_id' })
  user1!: User;

  @ManyToOne(() => User, (user) => user.matchesAsUser2, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_2_id' })
  user2!: User;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['active', 'unmatched'],
    default: 'active',
  })
  status!: 'active' | 'unmatched';

  @CreateDateColumn({ name: 'matched_at' })
  matchedAt!: Date;

  @Index('idx_users')
  @Column({ name: 'user_1_id' })
  user1Id!: number;

  @Column({ name: 'user_2_id' })
  user2Id!: number;

  @OneToOne(() => Conversation, (c) => c.match)
  conversation?: Conversation;
}

