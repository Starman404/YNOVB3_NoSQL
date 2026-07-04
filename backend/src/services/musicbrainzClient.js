import fetch from "node-fetch";

const BASE_URL = process.env.MUSICBRAINZ_BASE_URL || "https://musicbrainz.org/ws/2";
const USER_AGENT =
  process.env.MUSICBRAINZ_USER_AGENT || "MusicGraph/1.0.0 (contact@example.com)";
const RATE_LIMIT_MS = Number(process.env.MUSICBRAINZ_RATE_LIMIT_MS || 1100);

// File d'attente simple pour respecter la limite d'1 requête/seconde imposée par MusicBrainz
let queue = Promise.resolve();

function throttle(fn) {
  const run = queue.then(async () => {
    const result = await fn();
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
    return result;
  });
  // On avale les erreurs dans la queue pour ne pas bloquer les appels suivants
  queue = run.catch(() => {});
  return run;
}

/**
 * Appelle l'API MusicBrainz avec gestion des erreurs et du rate-limit.
 * @param {string} path - ex: "/artist", "/recording/<mbid>"
 * @param {object} params - query params (ex: { query: "Daft Punk", fmt: "json" })
 */
async function mbFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("fmt", "json");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  }

  return throttle(async () => {
    const response = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT }
    });

    if (response.status === 503) {
      throw new Error("MusicBrainz rate limit dépassé (503). Réessayer plus tard.");
    }
    if (!response.ok) {
      throw new Error(`Erreur MusicBrainz ${response.status} sur ${path}`);
    }
    return response.json();
  });
}

/** Recherche d'artistes par nom */
export function searchArtists(query, limit = 10) {
  return mbFetch("/artist", { query, limit });
}

/** Détail d'un artiste, avec relations optionnelles (genres, aires, etc.) */
export function getArtist(mbid) {
  return mbFetch(`/artist/${mbid}`, {
    inc: "genres+area-rels+tags+aliases"
  });
}

/** Recordings (morceaux) liés à un artiste */
export function getArtistRecordings(mbid, limit = 25, offset = 0) {
  return mbFetch("/recording", {
    artist: mbid,
    limit,
    offset,
    inc: "artist-credits+releases"
  });
}

/** Releases (albums) liés à un artiste */
export function getArtistReleases(mbid, limit = 25, offset = 0) {
  return mbFetch("/release", {
    artist: mbid,
    limit,
    offset,
    inc: "labels+recordings+release-groups"
  });
}

/** Détail d'un recording, avec crédits artistes complets (pour détecter feat.) */
export function getRecording(mbid) {
  return mbFetch(`/recording/${mbid}`, {
    inc: "artist-credits+artist-rels+releases"
  });
}

export default {
  searchArtists,
  getArtist,
  getArtistRecordings,
  getArtistReleases,
  getRecording
};
