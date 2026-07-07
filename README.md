# MusicGraph

Exploration des collaborations musicales avec l'API **MusicBrainz** et une base de données graphe **Neo4j**.

MusicGraph permet de rechercher des artistes, d'importer leurs morceaux et albums, de détecter leurs collaborations/featurings, puis de visualiser tout ça sous forme de graphe et de statistiques.

> Le sujet complet du projet (cahier des charges, barème) est disponible dans [`docs/sujet.md`](./docs/sujet.md).
> L'analyse des données produites et les limites du modèle sont détaillées dans [`docs/analyse.md`](./docs/analyse.md).
> Le modèle de données Neo4j est détaillé dans [`docs/data-model.md`](./docs/data-model.md).

---

## Stack technique

| Composant | Techno |
|---|---|
| Backend / API | NestJS (Node.js, TypeScript) |
| Base de données | Neo4j (Aura cloud ou instance locale) |
| Source de données | API publique MusicBrainz |
| Frontend | React 19 + Vite + TypeScript |
| Visualisation graphe | react-force-graph-2d |
| Conteneurisation | Docker / Docker Compose |

## Architecture

```
musicgraph/
├── backend/     # API NestJS (recherche, import, lecture Neo4j, stats, graphe)
├── frontend/    # Application React (recherche, fiches artistes, graphe, stats)
├── data/        # Jeu de données d'exemple + script de seed automatique
├── docs/        # Documentation (sujet, modèle de données, analyse)
├── docker-compose.yml
└── .env.example
```

Le frontend consomme uniquement l'API du backend (`/api/...`), qui lui-même interroge :
- **MusicBrainz** pour la recherche et la récupération de données musicales (avec respect du rate limit d'1 requête/seconde et d'un `User-Agent` dédié),
- **Neo4j** pour la persistance des artistes, morceaux, albums, genres, labels et collaborations sous forme de graphe.

## Prérequis

- Node.js 20+ (si lancement hors Docker)
- Docker et Docker Compose
- Aucune instance externe requise : le `docker-compose.yml` embarque un service **Neo4j** local (tout-en-Docker). Une base [Neo4j Aura](https://neo4j.com/cloud/aura/) cloud reste possible en alternative (voir section ci-dessous).

## Installation & lancement

### 1. Configuration

```bash
cp .env.example .env
```

Renseignez dans `.env` :
- `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEO4J_DATABASE` : accès à votre instance Neo4j (valeurs par défaut déjà prêtes pour le service Docker local, voir ci-dessous).
- `MUSICBRAINZ_USER_AGENT` : un User-Agent identifiable (ex: `MusicGraph/1.0.0 (votre.email@example.com)`), requis par MusicBrainz.

### 2. Lancement avec Docker Compose (recommandé)

```bash
docker-compose up --build
```

Le `docker-compose.yml` démarre **trois services** : `neo4j` (base graphe locale), `backend` (API) et `frontend` (site web). Tout est conteneurisé, aucune dépendance externe n'est nécessaire.

- Backend disponible sur `http://localhost:3000/api`
- Frontend disponible sur `http://localhost:5173`
- Neo4j Browser disponible sur `http://localhost:7474` (identifiants : `neo4j` / valeur de `NEO4J_LOCAL_PASSWORD`, `musicgraph123` par défaut)

Le service `backend` attend que `neo4j` soit prêt (healthcheck) avant de démarrer, et le driver Neo4j du backend se reconnecte simplement via `NEO4J_URI=bolt://neo4j:7687` (nom du service Docker), sans configuration supplémentaire.

> **Alternative Neo4j Aura (cloud)** : si vous préférez ne pas faire tourner Neo4j en local (ex: déploiement sans stockage persistant), remplacez dans `.env` les valeurs `NEO4J_URI`/`NEO4J_USERNAME`/`NEO4J_PASSWORD`/`NEO4J_DATABASE` par celles de votre instance [Neo4j Aura](https://neo4j.com/cloud/aura/) (voir les lignes commentées dans `.env.example`), puis retirez ou ignorez le service `neo4j` du `docker-compose.yml`.

### 3. Lancement en local sans Docker

```bash
# Backend
cd backend
npm install
npm run dev        # http://localhost:3000/api

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev         # http://localhost:5173
```

### 4. Peupler la base (optionnel)

Un script importe automatiquement une liste d'artistes (rap FR/US + quelques têtes d'affiche internationales) via l'API du backend :

```bash
cd data
npx ts-node seed.ts   # le backend doit tourner sur http://localhost:3000
```

Le fichier `data/french-rappers.json` liste également, à titre d'exemple/référence, des artistes et leurs MBID MusicBrainz.

## Utilisation

1. **Rechercher** un artiste par nom (page *Recherche*) → résultats MusicBrainz avec nom, MBID, pays, type, score de correspondance.
2. **Importer** un artiste depuis un résultat de recherche → création/mise à jour du nœud `Artist` dans Neo4j (déduplication par MBID), import de ses morceaux, albums et détection des collaborations.
3. **Explorer** : liste des artistes importés, fiche détail (morceaux, albums, collaborations), graphe interactif, statistiques (top artistes, top collaborations, top genres).

## API

Toutes les routes sont préfixées par `/api`. Résumé :

```
GET  /api/search/artists?q=...
POST /api/import/artists            { mbid }
GET  /api/artists
GET  /api/artists/:id
GET  /api/artists/:id/recordings
GET  /api/artists/:id/releases
GET  /api/artists/:id/collaborations

GET  /api/recordings
GET  /api/recordings/:id
GET  /api/recordings/:id/artists
GET  /api/recordings/:id/releases

GET  /api/releases
GET  /api/releases/:id
GET  /api/releases/:id/recordings
GET  /api/releases/:id/artists

GET  /api/graph
GET  /api/graph/artists/:id
GET  /api/graph/collaborations
GET  /api/graph/path?from=MBID_A&to=MBID_B   # plus court chemin entre 2 artistes

GET  /api/stats/overview
GET  /api/stats/top-artists
GET  /api/stats/top-collaborations
GET  /api/stats/top-genres
```

## Modèle de données

Voir [`docs/data-model.md`](./docs/data-model.md) pour le détail des nœuds (`Artist`, `Recording`, `Release`, `Label`, `Genre`, `Area`) et des relations (`PERFORMED`, `FEATURED_ON`, `COLLABORATED_WITH`, `APPEARS_ON`, `RELEASED_BY`, `ASSOCIATED_WITH_GENRE`, `FROM_AREA`, `RELEASED_IN`).

## Qualité des données

- Déduplication systématique via le MBID MusicBrainz (`MERGE` Cypher).
- Rate limiting respecté sur les appels MusicBrainz (1 requête/seconde).
- Gestion des erreurs API (voir `docs/analyse.md` pour le détail des cas gérés et des limites connues).
- Détection des collaborations sur deux axes : artistes multiples crédités sur un enregistrement MusicBrainz, et mots-clés (`feat.`, `ft.`, `featuring`, `avec`, `x`, `&`) dans les titres.

## Limites connues

Voir [`docs/analyse.md`](./docs/analyse.md) — notamment : couverture partielle du catalogue par artiste (import limité à 50 morceaux/albums), association morceau ↔ album par correspondance de titre (approximative), absence de recherche de plus court chemin entre deux artistes.

## Licence

Projet réalisé dans un cadre pédagogique (B3 Dev & B3 Data).
