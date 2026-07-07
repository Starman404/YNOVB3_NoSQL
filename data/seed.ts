/**
 * Script de seed — Importe automatiquement des rappeurs français dans Neo4j
 * via l'API MusicGraph (backend NestJS).
 *
 * Usage : npx ts-node data/seed.ts
 * (le backend doit tourner sur http://localhost:3000)
 */

import axios from 'axios';

const API = 'http://localhost:3000/api';

// Liste des rappeurs français / francophones actuels à importer
const RAPPERS = [
  'Booba',
  'PNL',
  'Nekfeu',
  'Damso',
  'SCH',
  'Jul',
  'Ninho',
  'Niska',
  'Aya Nakamura',
  'Gazo',
  'Tiakola',
  'Freeze Corleone',
  'SDM',
  "Rim'K",
  'Lacrim',
  'Kaaris',
  'Maes',
  'Dadju',
  'Gims',
  'Rohff',
  'La Fouine',
  'Soprano',
  'PLK',
  'Hamza',
  'Laylow',
  'Werenoi',
  'Guy2Bezbar',
  'Ziak',
  'Central Cee',
  'Stromae',
  'Daft Punk',
  'Kendrick Lamar',
  'Drake',
  'Travis Scott',
  'Jay-Z',
  '21 Savage',
  'Pharrell Williams',
];

// Pause entre chaque import (MusicBrainz limite à 1 req/sec, et l'import fait plusieurs requêtes)
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function seed() {
  console.log(`\n🎤 Seed MusicGraph — ${RAPPERS.length} artistes à importer\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < RAPPERS.length; i++) {
    const name = RAPPERS[i];
    console.log(`[${i + 1}/${RAPPERS.length}] Recherche de "${name}"...`);

    try {
      // 1. Recherche sur MusicBrainz via notre API
      const { data: results } = await axios.get(`${API}/search/artists`, {
        params: { q: name },
      });

      if (!results.length) {
        console.log(`   ❌ Aucun résultat pour "${name}"\n`);
        failed++;
        continue;
      }

      // On prend le premier résultat (le plus pertinent)
      const artist = results[0];
      console.log(`   Trouvé : ${artist.name} (${artist.country || '??'}) — score: ${artist.score}`);

      // 2. Import dans Neo4j via notre API
      const { data: result } = await axios.post(`${API}/import/artists`, {
        mbid: artist.id,
      });

      if (result.success) {
        console.log(`   ✅ Importé : ${result.artist}\n`);
        success++;
      } else {
        console.log(`   ⚠️ Import partiel\n`);
        skipped++;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      console.log(`   ❌ Erreur : ${msg}\n`);
      failed++;
    }

    // On attend entre chaque import pour pas spammer MusicBrainz
    await sleep(3000);
  }

  console.log('\n=============================');
  console.log(`✅ Importés : ${success}`);
  console.log(`⚠️ Skipped  : ${skipped}`);
  console.log(`❌ Échoués  : ${failed}`);
  console.log(`📊 Total    : ${RAPPERS.length}`);
  console.log('=============================\n');
}

seed().catch(console.error);
