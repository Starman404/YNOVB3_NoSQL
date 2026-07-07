import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { ArtistsService } from './artists.service';

@Controller()
export class ArtistsController {
  constructor(private readonly artists: ArtistsService) {}

  @Get('search/artists')
  search(@Query('q') query: string) {
    return this.artists.searchArtists(query);
  }

  @Post('import/artists')
  importArtist(@Body('mbid') mbid: string) {
    return this.artists.importArtist(mbid);
  }

  @Get('artists')
  getAll() {
    return this.artists.getAll();
  }

  @Get('artists/:id')
  getById(@Param('id') id: string) {
    return this.artists.getById(id);
  }

  @Get('artists/:id/recordings')
  getRecordings(@Param('id') id: string) {
    return this.artists.getRecordings(id);
  }

  @Get('artists/:id/releases')
  getReleases(@Param('id') id: string) {
    return this.artists.getReleases(id);
  }

  @Get('artists/:id/collaborations')
  getCollaborations(@Param('id') id: string) {
    return this.artists.getCollaborations(id);
  }

  @Delete('artists/:id')
  delete(@Param('id') id: string) {
    return this.artists.deleteArtist(id);
  }
}
