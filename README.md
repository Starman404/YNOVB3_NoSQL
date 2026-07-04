# MusicGraph

Exploration des collaborations musicales avec MusicBrainz et Neo4j.

> Ce README couvre le lancement du projet. La documentation du modèle de
> données, des choix techniques et de l'analyse data se trouve dans `docs/`.

## Prérequis

* **Docker** et **Docker Compose** installés et démarrés

  * Vérifier : `docker --version` et `docker compose version`
  * Sur Windows/Mac : Docker Desktop doit être lancé (icône baleine active)
  * Sur Linux : le service `docker` doit tourner (`sudo systemctl status docker`)
* Rien d'autre à installer : Node.js, les librairies (`express`, `react`,
`neo4j-driver`, etc.) sont installés automatiquement **dans les conteneurs**
au moment du build, pas besoin de `npm install` sur ta machine.

## 1\. Configuration

À la racine du projet :

```bash
cp .env.example .env
```

Puis ouvrir `.env` et modifier au minimum :

```env
MUSICBRAINZ\_USER\_AGENT=MusicGraph/1.0.0 (ton-email@example.com)
NEO4J\_PASSWORD=un\_mot\_de\_passe\_de\_ton\_choix
```

`MUSICBRAINZ\_USER\_AGENT` doit contenir un vrai contact : c'est obligatoire
pour que l'API MusicBrainz accepte les requêtes sans les limiter fortement.

## 2\. Lancer le projet

**Premier lancement** (construit les images, obligatoire la première fois
et à chaque fois qu'un `package.json` change) :

```bash
docker compose up --build
```

**Lancements suivants** :

```bash
docker compose up
```

Laisser le terminal ouvert : les logs des 3 services (Neo4j, backend,
frontend) s'affichent en direct. `Ctrl+C` pour arrêter proprement.

Pour lancer en arrière-plan (sans bloquer le terminal) :

```bash
docker compose up -d
# puis pour voir les logs si besoin :
docker compose logs -f
```

## 3\. Vérifier que tout fonctionne

Une fois démarré (le premier lancement peut prendre 1-2 minutes, le temps
que Neo4j s'initialise), ouvrir dans le navigateur :

|Service|URL|Résultat attendu|
|-|-|-|
|Frontend|http://localhost:5173|Page d'accueil MusicGraph|
|Backend (API)|http://localhost:4000/health|`{"status":"ok","service":"musicgraph-backend"}`|
|Neo4j Browser|http://localhost:7474|Interface de connexion Neo4j (login = `NEO4J\_USER`/`NEO4J\_PASSWORD` du `.env`)|

Si les 3 répondent, l'environnement est opérationnel.

## 4\. Arrêter le projet

```bash
# Arrêter les conteneurs (garde les données Neo4j)
docker compose down

# Arrêter ET supprimer les données Neo4j (repart de zéro)
docker compose down -v
```

## Commandes utiles

```bash
# Voir les conteneurs en cours d'exécution
docker compose ps

# Voir les logs d'un seul service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f neo4j

# Redémarrer un seul service après une modif de config
docker compose restart backend

# Reconstruire un seul service (après ajout d'une dépendance dans package.json)
docker compose up --build backend

# Ouvrir un terminal dans un conteneur (debug)
docker compose exec backend sh
```

## Problèmes fréquents

* **`Cannot connect to the Docker daemon`** → Docker Desktop n'est pas lancé.
* **Le backend redémarre en boucle / erreur de connexion Neo4j** → Neo4j n'a
pas fini de démarrer. `docker compose up` attend normalement que Neo4j soit
prêt (healthcheck) avant de lancer le backend ; si l'erreur persiste,
regarder `docker compose logs neo4j`.
* **Port déjà utilisé (`port is already allocated`)** → un autre programme
utilise déjà le port 5173, 4000 ou 7474/7687. Soit fermer ce programme,
soit changer le port dans `.env` (`BACKEND\_PORT`, `FRONTEND\_PORT`).
* **Modification du code non prise en compte** → les dossiers `backend/` et
`frontend/` sont montés en volume (voir `docker-compose.yml`), donc le code
se recharge normalement à chaud. Si ça bloque, `docker compose restart backend`
(ou `frontend`).

## Structure du projet

```
musicgraph/
├── backend/     API Express + intégration MusicBrainz + Neo4j
├── frontend/    Interface web React
├── data/        Jeux de données / exports
├── docs/        Documentation (modèle de données, choix techniques, analyse)
└── docker-compose.yml
```

## Répartition du travail

Voir `TASKS.md`.

