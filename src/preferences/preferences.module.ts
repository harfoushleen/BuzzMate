import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preference } from './preference.entity';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { UsersModule } from '../users/users.module';
import { DiscoverModule } from '../discover/discover.module';

@Module({
  imports: [TypeOrmModule.forFeature([Preference]), UsersModule, forwardRef(() => DiscoverModule)],
  providers: [PreferencesService],
  controllers: [PreferencesController],
  exports: [PreferencesService],
})
export class PreferencesModule {}

