import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Match } from '../matches/match.entity';

@Entity('Date_Feedback')
export class DateFeedback {
  @PrimaryGeneratedColumn()
  feedback_id!: number;

  @Column()
  match_id!: number;

  @Column()
  reviewer_id!: number;

  @Column()
  reviewee_id!: number;

  @Column({ type: 'tinyint' })
  rating!: number;

  @Column({ type: 'tinyint' })
  place_rating!: number;

  @Column()
  go_again!: boolean;

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @Column()
  suggestion_id!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Match)
  @JoinColumn({ name: 'match_id' })
  match?: Match;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewee_id' })
  reviewee?: User;
}