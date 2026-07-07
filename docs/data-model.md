# Modèle de données Neo4j — MusicGraph

## Nœuds

| Label     | Propriétés principales                                          |
|-----------|-----------------------------------------------------------------|
| Artist    | mbid, name, type, country, gender, beginDate, endDate, disambiguation |
| Recording | mbid, title, length, firstReleaseDate, hasFeaturing             |
| Release   | mbid, title, date, country, status, releaseType                 |
| Genre     | name                                                            |
| Label     | mbid, name                                                      |
| Area      | name, type                                                      |

## Relations

| Relation              | De         | Vers      | Description                        |
|-----------------------|------------|-----------|-------------------------------------|
| PERFORMED             | Artist     | Recording | L'artiste a interprété ce morceau   |
| FEATURED_ON           | Artist     | Recording | L'artiste apparaît en featuring     |
| COLLABORATED_WITH     | Artist     | Artist    | Collaboration détectée              |
| APPEARS_ON            | Recording  | Release   | Le morceau apparaît sur cet album   |
| RELEASED_BY           | Release    | Label     | Album publié par ce label           |
| ASSOCIATED_WITH_GENRE | Artist     | Genre     | Genre musical de l'artiste          |
| FROM_AREA             | Artist     | Area      | Pays d'origine de l'artiste         |
| RELEASED_IN           | Release    | Area      | Pays de publication de l'album      |

## Schéma visuel

```
(Artist)-[:PERFORMED]->(Recording)-[:APPEARS_ON]->(Release)-[:RELEASED_BY]->(Label)
(Artist)-[:FEATURED_ON]->(Recording)
(Artist)-[:COLLABORATED_WITH]->(Artist)
(Artist)-[:ASSOCIATED_WITH_GENRE]->(Genre)
(Artist)-[:FROM_AREA]->(Area)
(Release)-[:RELEASED_IN]->(Area)
```

## Source des données

Toutes les données proviennent de l'API MusicBrainz (https://musicbrainz.org/ws/2).
Les identifiants MBID (MusicBrainz ID) sont utilisés comme clés uniques pour éviter les doublons.
Le rate limiting est respecté (1 requête/seconde max).
