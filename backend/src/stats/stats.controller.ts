import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('overview')
  getOverview() {
    return this.stats.getOverview();
  }

  @Get('top-artists')
  getTopArtists() {
    return this.stats.getTopArtists();
  }

  @Get('top-collaborations')
  getTopCollaborations() {
    return this.stats.getTopCollaborations();
  }

  @Get('top-genres')
  getTopGenres() {
    return this.stats.getTopGenres();
  }
}
