import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpsertPreferenceDto } from './dto/upsert-preference.dto';

@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get(':userId')
  getForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.preferencesService.getForUser(userId);
  }

  @Put(':userId')
  upsert(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpsertPreferenceDto,
  ) {
    return this.preferencesService.upsert(userId, dto);
  }
}

