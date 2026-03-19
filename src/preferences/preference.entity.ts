import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'Preferences' })
@Unique(['user'])
export class Preference {
  @PrimaryGeneratedColumn({ name: 'preference_id' })
  preferenceId!: number;

  @OneToOne(() => User, (user) => user.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'min_age', type: 'int', default: 18 })
  minAge!: number;

  @Column({ name: 'max_age', type: 'int', default: 99 })
  maxAge!: number;

  @Column({ name: 'max_distance', type: 'int', default: 50 })
  maxDistance!: number;

  @Column({
    name: 'preferred_gender',
    type: 'enum',
    enum: ['male', 'female', 'other', 'any'],
    default: 'any',
  })
  preferredGender!: 'male' | 'female' | 'other' | 'any';

  @Column({
    name: 'Date_Mood',
    type: 'enum',
    enum: ['casual', 'romantic', 'adventurous', 'unsure'],
    default: 'unsure',
  })
  dateMood!: 'casual' | 'romantic' | 'adventurous' | 'unsure';

  @Column({ name: 'max_price_tier', type: 'int', default: 3 })
  maxPriceTier!: number;

  @Column({
    name: 'Hobbies',
    type: 'set',
    enum: ['handcrafts', 'sports', 'art', 'music', 'gaming', 'travel', 'food', 'movies', 'reading', 'photography'],
    nullable: true,
  })
  hobbies?: string[];

  @Column({ name: 'opener', type: 'varchar', length: 140, nullable: true })
  opener?: string;
}

