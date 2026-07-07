import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { GraphService } from './graph.service';

@Controller('graph')
export class GraphController {
  constructor(private readonly graph: GraphService) {}

  @Get()
  getFullGraph() {
    return this.graph.getFullGraph();
  }

  // Plus court chemin entre deux artistes : GET /api/graph/path?from=MBID_A&to=MBID_B
  @Get('path')
  getShortestPath(@Query('from') from: string, @Query('to') to: string) {
    if (!from || !to) {
      throw new BadRequestException(
        "Les paramètres 'from' et 'to' (MBID des deux artistes) sont requis.",
      );
    }
    return this.graph.getShortestPath(from, to);
  }

  @Get('artists/:id')
  getArtistGraph(@Param('id') id: string) {
    return this.graph.getArtistGraph(id);
  }

  @Get('collaborations')
  getCollaborationsGraph() {
    return this.graph.getCollaborationsGraph();
  }
}
