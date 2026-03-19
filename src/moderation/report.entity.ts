import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'Reports' })
@Unique('unique_report', ['reporter', 'reported'])
export class Report {
  @PrimaryGeneratedColumn({ name: 'report_id' })
  reportId!: number;

  @ManyToOne(() => User, (u) => u.reportsMade, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter!: User;

  @ManyToOne(() => User, (u) => u.reportsReceived, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reported_id' })
  reported!: User;

  @Column({ type: 'text' })
  reason!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'reporter_id' })
  reporterId!: number;

  @Column({ name: 'reported_id' })
  reportedId!: number;
}

