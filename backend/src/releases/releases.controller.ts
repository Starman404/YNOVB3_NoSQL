import { Controller, Get, Param } from '@nestjs/common';
import { ReleasesService } from './releases.service';

@Controller('releases')
export class ReleasesController {
  constructor(private readonly releases: ReleasesService) {}

  @Get()
  getAll() {
    return this.releases.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.releases.getById(id);
  }

  @Get(':id/recordings')
  getRecordings(@Param('id') id: string) {
    return this.releases.getRecordings(id);
  }

  @Get(':id/artists')
  getArtists(@Param('id') id: string) {
    return this.releases.getArtists(id);
  }
}
