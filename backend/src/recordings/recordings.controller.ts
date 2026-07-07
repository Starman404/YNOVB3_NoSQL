import { Controller, Get, Param } from '@nestjs/common';
import { RecordingsService } from './recordings.service';

@Controller('recordings')
export class RecordingsController {
  constructor(private readonly recordings: RecordingsService) {}

  @Get()
  getAll() {
    return this.recordings.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.recordings.getById(id);
  }

  @Get(':id/artists')
  getArtists(@Param('id') id: string) {
    return this.recordings.getArtists(id);
  }

  @Get(':id/releases')
  getReleases(@Param('id') id: string) {
    return this.recordings.getReleases(id);
  }
}
