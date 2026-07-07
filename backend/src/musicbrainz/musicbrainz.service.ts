import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

// Ce service communique avec l'API MusicBrainz (base de données musicale publique).
// MusicBrainz contient des millions d'artistes, morceaux et albums.
// On l'utilise pour chercher et importer des artistes dans notre base Neo4j.
//
// IMPORTANT : MusicBrainz limite à 1 requête par seconde.
// La méthode rateLimit() s'assure qu'on respecte cette limite.

@Injectable()
export class MusicbrainzService {
  private api: AxiosInstance;
  private lastRequestTime = 0;

  constructor(private config: ConfigService) {
    // On crée un client HTTP (axios) configuré pour MusicBrainz
    this.api = axios.create({
      baseURL: this.config.get('MUSICBRAINZ_API_URL') || 'https://musicbrainz.org/ws/2',
      headers: {
        // User-Agent obligatoire pour MusicBrainz (ils veulent savoir qui appelle leur API)
        'User-Agent': this.config.get('MUSICBRAINZ_USER_AGENT') || 'MusicGraph/1.0.0',
        Accept: 'application/json',
      },
    });
  }

  // Attend 1.1 seconde entre chaque requête (limite imposée par MusicBrainz)
  private async rateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < 1100) {
      await new Promise((r) => setTimeout(r, 1100 - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  // Petit wrapper autour d'axios qui centralise :
  // - le respect du rate limit MusicBrainz,
  // - la conversion des erreurs HTTP/réseau en exceptions NestJS lisibles,
  // au lieu de laisser planter le serveur sur une 404/500/timeout de MusicBrainz.
  private async request<T = any>(path: string, params: Record<string, any>): Promise<T> {
    await this.rateLimit();
    try {
      const { data } = await this.api.get(path, { params });
      return data;
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 404) {
        throw new NotFoundException(`Ressource MusicBrainz introuvable : ${path}`);
      }
      if (status === 429) {
        throw new BadGatewayException('MusicBrainz a temporairement limité les requêtes (429). Réessayez dans quelques secondes.');
      }
      if (status) {
        throw new BadGatewayException(`Erreur MusicBrainz (${status}) sur ${path}`);
      }
      // Pas de réponse HTTP -> problème réseau/timeout/DNS
      throw new BadGatewayException(`MusicBrainz est injoignable (${err?.code || err?.message || 'erreur inconnue'})`);
    }
  }

  // Recherche des artistes par nom (ex: "Booba" → liste de résultats)
  async searchArtists(query: string, limit = 25) {
    if (!query?.trim()) return [];
    const data = await this.request('/artist', { query, limit, fmt: 'json' });
    return data.artists || [];
  }

  // Récupère les détails d'un artiste par son mbid (avec ses genres et tags)
  async getArtist(mbid: string) {
    return this.request(`/artist/${mbid}`, { fmt: 'json', inc: 'genres+tags' });
  }

  // Récupère les morceaux d'un artiste (limit = combien, offset = à partir de quel numéro)
  async getArtistRecordings(mbid: string, limit = 100, offset = 0) {
    return this.request('/recording', { artist: mbid, limit, offset, fmt: 'json' });
  }

  // Récupère les albums d'un artiste (avec les infos des labels)
  async getArtistReleases(mbid: string, limit = 100, offset = 0) {
    return this.request('/release', { artist: mbid, limit, offset, fmt: 'json', inc: 'labels' });
  }

  // Récupère les détails d'un morceau spécifique (avec ses artistes et albums)
  async getRecording(mbid: string) {
    return this.request(`/recording/${mbid}`, { fmt: 'json', inc: 'artists+releases' });
  }

  // Récupère les détails d'un album spécifique (avec artistes, morceaux et labels)
  async getRelease(mbid: string) {
    return this.request(`/release/${mbid}`, { fmt: 'json', inc: 'artists+recordings+labels' });
  }

  // Récupère les relations d'un artiste (collaborations, membres de groupe, etc.)
  async getArtistRelationships(mbid: string) {
    const data = await this.request(`/artist/${mbid}`, { fmt: 'json', inc: 'artist-rels' });
    return data.relations || [];
  }
}
