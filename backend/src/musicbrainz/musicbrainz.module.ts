import { Module } from '@nestjs/common';
import { MusicbrainzService } from './musicbrainz.service';

@Module({
  providers: [MusicbrainzService],
  exports: [MusicbrainzService],
})
export class MusicbrainzModule {}
