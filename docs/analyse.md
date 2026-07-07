# Analyse des données — MusicGraph

Ce document présente les analyses produites par l'application (endpoints `/api/stats/\*` et `/api/graph/\*`) ainsi que les limites connues du modèle et de la méthode de collecte.

## 1\. Statistiques produites

|Analyse|Endpoint|Méthode|
|-|-|-|
|Vue d'ensemble (nb d'artistes, morceaux, albums, collaborations, genres)|`GET /api/stats/overview`|Comptage de nœuds/relations Cypher|
|Top artistes les plus connectés|`GET /api/stats/top-artists`|Nombre de `Recording` liés par `PERFORMED`, triés décroissant|
|Top collaborations|`GET /api/stats/top-collaborations`|Paires d'artistes reliées par `COLLABORATED\_WITH`, avec nombre de morceaux communs|
|Top genres|`GET /api/stats/top-genres`|Nombre d'artistes reliés à chaque `Genre` par `ASSOCIATED\_WITH\_GENRE`|
|Graphe des collaborations|`GET /api/graph/collaborations`|Sous-graphe `Artist-\[:COLLABORATED\_WITH]-Artist`|
|Graphe centré artiste|`GET /api/graph/artists/:id`|Voisinage à 2 sauts autour d'un artiste (morceaux, albums, genres, collaborateurs)|

Ces analyses répondent directement à plusieurs des questions posées dans la problématique du sujet :

* *Quels artistes sont les plus connectés ?* → `top-artists` / `top-collaborations`.
* *Quels genres musicaux sont les plus présents ?* → `top-genres`.
* *Quels artistes ont collaboré ensemble ?* → `top-collaborations` + graphe des collaborations.

## 2\. Constats sur le jeu de données

Le jeu de données a été constitué en important une sélection d'artistes (principalement rap FR/BE et quelques artistes internationaux, via `data/seed.ts`) plutôt que l'intégralité du catalogue MusicBrainz. Conséquences observées :

* Le graphe de collaborations reste **centré sur les artistes explicitement importés** : deux artistes peuvent avoir réellement collaboré sans que la relation `COLLABORATED\_WITH` apparaisse, si l'un des deux morceaux n'a pas été importé.
* Les genres MusicBrainz sont **très hétérogènes en granularité** (ex: "french hip hop" vs "hip hop" vs "rap") : le classement `top-genres` sépare des genres qui, pour un humain, seraient identiques. Une normalisation (regroupement de synonymes) améliorerait la lisibilité.
* Le nombre de morceaux et d'albums par artiste est **plafonné à 50** lors de l'import (`getArtistRecordings` / `getArtistReleases`), pour limiter le volume d'appels à MusicBrainz. Les artistes très prolifiques sont donc sous-représentés par rapport à leur discographie réelle.

## 3\. Limites du modèle de graphe

* **Détection des collaborations** : elle repose sur les crédits MusicBrainz (`artist-credit`) et sur un motif de mots-clés (`feat.`, `ft.`, `featuring`, `avec`, `x`, `\&`) dans le titre. Ce second critère peut générer de faux positifs (ex: un titre contenant simplement le caractère `\&` sans qu'il s'agisse d'un featuring) et ne crée pas systématiquement de nœud supplémentaire — il se contente de marquer `hasFeaturing = true` sur le `Recording`, sans garantir qu'un artiste correspondant a été importé.
* **Association morceau ↔ album** (`APPEARS\_ON`) : elle est établie par **correspondance de titre** (`rl.title = r.title OR r.title CONTAINS rl.title`), faute de disposer directement des identifiants de lien recording→release dans les réponses `inc=` utilisées. Cette heuristique peut créer des liens incorrects en cas de titres identiques entre artistes différents, ou manquer des liens si les titres diffèrent légèrement (single vs version album, remaster, etc.).
* **Plus court chemin entre deux artistes** : implémenté via `GET /api/graph/path?from=...\&to=...`, qui s'appuie sur `shortestPath((a)-\[\*..6]-(b))` en Cypher. Le chemin retourné peut passer par des nœuds intermédiaires (`Recording`, `Release`, `Genre`...) et pas uniquement par des relations `COLLABORATED\_WITH` directes ; la limite à 6 sauts est un compromis pour éviter des parcours de graphe trop coûteux sur un jeu de données qui grandit.
* **Pas de gestion des variantes de noms/alias** : MusicBrainz fournit des alias (noms alternatifs, orthographes locales) qui ne sont pas importés ; deux mentions différentes du même artiste sous un alias non canonique pourraient théoriquement créer un doublon logique (bien que le MBID reste la clé unique utilisée, donc pas de doublon de nœud, mais un risque de non-reconnaissance côté recherche texte).
* **Dépendance à la disponibilité/qualité des données MusicBrainz** : certains artistes ont des fiches incomplètes (pas de genre, pas de date, pas de pays), ce qui limite les statistiques les concernant (nœuds avec propriétés `null`).

