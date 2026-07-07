import { Injectable, InternalServerErrorException, Logger, OnModuleInit, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session } from 'neo4j-driver';

// Ce service gère la connexion à Neo4j.
// Neo4j utilise un "driver" pour se connecter, comme une prise entre ton app et la base.
// Une "session" c'est une conversation temporaire avec la base (on l'ouvre, on fait la requête, on la ferme).

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver: Driver;
  private readonly logger = new Logger(Neo4jService.name);
  // Passe à true si la connexion initiale échoue, pour renvoyer une erreur
  // explicite au lieu de laisser chaque requête planter avec un message obscur.
  private connectionFailed = false;

  constructor(private config: ConfigService) {}

  // Quand le serveur démarre, on se connecte à Neo4j avec l'URI et le mot de passe du .env
  async onModuleInit() {
    const uri = this.config.get('NEO4J_URI');
    const username = this.config.get('NEO4J_USERNAME');
    const password = this.config.get('NEO4J_PASSWORD');

    if (!uri || !username || !password) {
      this.connectionFailed = true;
      this.logger.error(
        'Variables NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD manquantes dans le .env — connexion Neo4j non initialisée.',
      );
      return;
    }

    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    try {
      await this.driver.verifyConnectivity();
      this.logger.log('Connected to Neo4j Aura');
    } catch (err: any) {
      this.connectionFailed = true;
      this.logger.error(`Neo4j connection failed: ${err.message}`);
    }
  }

  // Ouvre une session (une conversation) avec la base
  getSession(): Session {
    return this.driver.session({
      database: this.config.get('NEO4J_DATABASE') || 'neo4j',
    });
  }

  // Exécute une requête Cypher (le langage de Neo4j, comme SQL mais pour les graphes)
  // cypher = la requête, params = les variables qu'on passe dedans (ex: {mbid: "xxx"})
  async run(cypher: string, params: Record<string, any> = {}) {
    if (this.connectionFailed || !this.driver) {
      throw new ServiceUnavailableException(
        'Base Neo4j indisponible : vérifiez NEO4J_URI/NEO4J_USERNAME/NEO4J_PASSWORD et que la base est démarrée.',
      );
    }

    const session = this.getSession();
    try {
      const result = await session.run(cypher, params);
      return result.records;
    } catch (err: any) {
      this.logger.error(`Requête Cypher échouée: ${err.message}`);
      throw new InternalServerErrorException('Erreur lors de la requête sur la base Neo4j.');
    } finally {
      // Toujours fermer la session après usage
      await session.close();
    }
  }

  // Quand le serveur s'arrête, on ferme la connexion proprement
  async onModuleDestroy() {
    if (this.driver) {
      await this.driver.close();
    }
  }
}
