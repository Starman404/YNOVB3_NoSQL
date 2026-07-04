\# Liste de tâches — MusicGraph



\## Personne A — Data \& Backend (écriture)



\- \[ ] Finaliser le client MusicBrainz (recherche, recordings, releases, crédits) \*(Intégration MusicBrainz)\*

\- \[ ] Gérer les erreurs API (503, timeout, réponses manquantes) \*(Intégration MusicBrainz)\*

\- \[ ] `POST /api/import/artists` : import d'un artiste dans Neo4j \*(Modélisation Neo4j)\*

\- \[ ] Import des genres et de l'aire d'origine de l'artiste \*(Modélisation Neo4j)\*

\- \[ ] Import des recordings + relation `PERFORMED` \*(Modélisation Neo4j)\*

\- \[ ] Import des releases + relation `APPEARS\_ON` \*(Modélisation Neo4j)\*

\- \[ ] Import des labels + relation `RELEASED\_BY` \*(Modélisation Neo4j)\*

\- \[ ] Détection des collaborations (crédits multiples, feat./ft./x/\&, relations MusicBrainz) \*(Modélisation Neo4j)\*

\- \[ ] Création des relations `COLLABORATED\_WITH` / `FEATURED\_ON` \*(Modélisation Neo4j)\*

\- \[ ] Vérifier l'anti-doublons partout (MERGE sur MBID) \*(Qualité des données)\*

\- \[ ] Gérer les données manquantes de façon cohérente \*(Qualité des données)\*

\- \[ ] `GET /api/stats/overview`, `top-artists`, `top-collaborations`, `top-genres` \*(Backend \& API)\*

\- \[ ] Extraire les tops finaux et rédiger l'analyse (limites du graphe, biais des données) \*(Analyse data)\*

\- \[ ] Rédiger `docs/modele-de-donnees.md` \*(README \& documentation)\*



\## Personne B — API lecture \& Frontend



\- \[ ] `GET /api/search/artists` \*(Backend \& API)\*

\- \[ ] `GET /api/artists`, `/api/artists/:id` \*(Backend \& API)\*

\- \[ ] `GET /api/artists/:id/recordings`, `/releases`, `/collaborations` \*(Backend \& API)\*

\- \[ ] `GET /api/recordings\*`, `/api/releases\*` \*(Backend \& API)\*

\- \[ ] `GET /api/graph`, `/api/graph/artists/:id`, `/api/graph/collaborations` \*(Backend \& API)\*

\- \[ ] Page Accueil \*(Interface web)\*

\- \[ ] Page Recherche + bouton import \*(Interface web)\*

\- \[ ] Page Liste des artistes \*(Interface web)\*

\- \[ ] Page Détail artiste \*(Interface web)\*

\- \[ ] Page Morceaux \*(Interface web)\*

\- \[ ] Page Graphe (visualisation interactive) \*(Interface web)\*

\- \[ ] Page Statistiques \*(Interface web)\*

\- \[ ] Gestion des états de chargement/erreur sur les pages \*(Interface web)\*



\## À faire ensemble



\- \[ ] Compléter le README \*(README \& documentation)\*

\- \[ ] Rédiger `docs/choix-techniques.md` \*(README \& documentation)\*

\- \[ ] Préparer la démo et les slides pour l'oral \*(Présentation orale)\*



