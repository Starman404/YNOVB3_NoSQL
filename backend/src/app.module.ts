import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { MusicbrainzModule } from './musicbrainz/musicbrainz.module';
import { ArtistsModule } from './artists/artists.module';
import { RecordingsModule } from './recordings/recordings.module';
import { ReleasesModule } from './releases/releases.module';
import { GraphModule } from './graph/graph.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    Neo4jModule,
    MusicbrainzModule,
    ArtistsModule,
    RecordingsModule,
    ReleasesModule,
    GraphModule,
    StatsModule,
  ],
})
export class AppModule {}
