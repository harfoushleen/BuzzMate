import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'Interactions' })
export class Interaction {
  @PrimaryGeneratedColumn({ name: 'interaction_id' })
  interactionId!: number;

  @ManyToOne(() => User, (user) => user.sentInteractions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @ManyToOne(() => User, (user) => user.receivedInteractions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiver_id' })
  receiver!: User;

  @Column({
    name: 'action_type',
    type: 'enum',
    enum: ['like', 'dislike'],
  })
  actionType!: 'like' | 'dislike';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Index('idx_sender_receiver')
  @Column({ name: 'sender_id' })
  senderId!: number;

  @Column({ name: 'receiver_id' })
  receiverId!: number;
}

