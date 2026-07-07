import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';

// Ce service construit les données pour le graphe interactif du frontend.
// Il renvoie des noeuds et des liens au format { nodes, links }
// que react-force-graph-2d utilise pour dessiner le graphe.

@Injectable()
export class GraphService {
  constructor(private neo4j: Neo4jService) {}

  // Récupère le graphe complet : tous les artistes et leurs relations
  async getFullGraph() {
    const records = await this.neo4j.run(
      // MATCH (a:Artist)-[rel]->(b) = on cherche tous les artistes reliés à quelque chose
      // type(rel) = donne le nom de la relation (PERFORMED, ASSOCIATED_WITH_GENRE, etc.)
      `MATCH (a:Artist)-[rel]->(b)
       RETURN a, type(rel) as relType, b
       LIMIT 500`,
    );

    // On utilise une Map pour éviter les noeuds en double
    // (un artiste peut apparaître dans plusieurs relations)
    const nodes = new Map<string, any>();
    const links: any[] = [];

    for (const record of records) {
      const a = record.get('a');
      const b = record.get('b');
      const relType = record.get('relType');

      const aId = a.properties.mbid || a.properties.name;
      const bId = b.properties.mbid || b.properties.name;

      // On ajoute le noeud A s'il n'existe pas encore dans la Map
      if (!nodes.has(aId)) {
        nodes.set(aId, {
          id: aId,
          label: a.properties.name,
          type: a.labels[0], // labels[0] = le type du noeud (Artist, Genre, etc.)
          ...a.properties,
        });
      }
      // Pareil pour le noeud B
      if (!nodes.has(bId)) {
        nodes.set(bId, {
          id: bId,
          label: b.properties.name || b.properties.title,
          type: b.labels[0],
          ...b.properties,
        });
      }
      // On ajoute le lien entre A et B
      links.push({ source: aId, target: bId, type: relType });
    }

    return { nodes: Array.from(nodes.values()), links };
  }

  // Récupère le graphe centré sur un artiste spécifique
  // Ex: le graphe de Booba avec ses morceaux, genres, collabs...
  async getArtistGraph(mbid: string) {
    const records = await this.neo4j.run(
      // On part de l'artiste, on va chercher ses voisins (b)
      // puis les voisins de ses voisins (c) pour avoir un graphe plus riche
      // WHERE c <> a = on exclut l'artiste de départ pour pas faire de boucle
      `MATCH (a:Artist {mbid: $mbid})-[r]-(b)
       OPTIONAL MATCH (b)-[r2]-(c)
       WHERE c <> a
       RETURN a, type(r) as r1Type, b, type(r2) as r2Type, c
       LIMIT 300`,
      { mbid },
    );
    const nodes = new Map<string, any>();
    const links: any[] = [];

    for (const record of records) {
      const a = record.get('a');
      const b = record.get('b');
      const c = record.get('c');

      // Fonction utilitaire pour ajouter un noeud sans doublon
      const addNode = (node: any) => {
        const id = node.properties.mbid || node.properties.name;
        if (!nodes.has(id)) {
          nodes.set(id, {
            id,
            label: node.properties.name || node.properties.title,
            type: node.labels[0],
            ...node.properties,
          });
        }
        return id;
      };

      const aId = addNode(a);
      const bId = addNode(b);
      links.push({ source: aId, target: bId, type: record.get('r1Type') });

      // Si on a un voisin de niveau 2 (c), on l'ajoute aussi
      if (c) {
        const cId = addNode(c);
        links.push({ source: bId, target: cId, type: record.get('r2Type') });
      }
    }

    return { nodes: Array.from(nodes.values()), links };
  }

  // Calcule le plus court chemin entre deux artistes dans le graphe.
  // Répond à la question du sujet : "Quels chemins relient deux artistes ?"
  // On traverse toutes les relations (peu importe le sens ni le type) sur 6 sauts
  // maximum : le chemin peut donc passer par des Recording, Release, Genre, etc.
  // (ex: Artist A -[PERFORMED]-> Recording -[APPEARS_ON]-> Release <-[APPEARS_ON]- Recording <-[PERFORMED]- Artist B)
  async getShortestPath(fromMbid: string, toMbid: string) {
    const records = await this.neo4j.run(
      `MATCH (a:Artist {mbid: $fromMbid}), (b:Artist {mbid: $toMbid})
       MATCH p = shortestPath((a)-[*..6]-(b))
       RETURN p`,
      { fromMbid, toMbid },
    );

    if (records.length === 0) {
      return { found: false, length: 0, nodes: [], links: [] };
    }

    const path = records[0].get('p');
    const nodes = new Map<string, any>();
    const links: any[] = [];

    // path.segments contient chaque "tronçon" du chemin : { start, relationship, end }
    for (const segment of path.segments) {
      const addNode = (node: any) => {
        const id = node.properties.mbid || node.properties.name;
        if (!nodes.has(id)) {
          nodes.set(id, {
            id,
            label: node.properties.name || node.properties.title,
            type: node.labels[0],
            ...node.properties,
          });
        }
        return id;
      };

      const startId = addNode(segment.start);
      const endId = addNode(segment.end);
      links.push({
        source: startId,
        target: endId,
        type: segment.relationship.type,
      });
    }

    // Cas particulier : chemin de longueur 0 (from === to), path.segments est vide
    if (path.segments.length === 0 && path.start) {
      const onlyNode = path.start;
      const id = onlyNode.properties.mbid || onlyNode.properties.name;
      nodes.set(id, {
        id,
        label: onlyNode.properties.name,
        type: onlyNode.labels[0],
        ...onlyNode.properties,
      });
    }

    return {
      found: true,
      length: path.length, // nombre de relations traversées
      nodes: Array.from(nodes.values()),
      links,
    };
  }

  // Récupère uniquement le graphe des collaborations entre artistes
  async getCollaborationsGraph() {
    const records = await this.neo4j.run(
      // On cherche juste les relations COLLABORATED_WITH entre artistes
      `MATCH (a:Artist)-[r:COLLABORATED_WITH]->(b:Artist)
       RETURN a, b
       LIMIT 200`,
    );
    const nodes = new Map<string, any>();
    const links: any[] = [];

    for (const record of records) {
      const a = record.get('a');
      const b = record.get('b');

      for (const node of [a, b]) {
        const id = node.properties.mbid;
        if (!nodes.has(id)) {
          nodes.set(id, {
            id,
            label: node.properties.name,
            type: 'Artist',
            ...node.properties,
          });
        }
      }
      links.push({
        source: a.properties.mbid,
        target: b.properties.mbid,
        type: 'COLLABORATED_WITH',
      });
    }

    return { nodes: Array.from(nodes.values()), links };
  }
}
