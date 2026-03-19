import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'Discover_Suggestions' })
@Unique('ux_user', ['user'])
export class DiscoverSuggestion {
  @PrimaryGeneratedColumn({ name: 'suggestion_id' })
  suggestionId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'candidate_ids', type: 'json' })
  candidateIds!: number[];

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;
}

