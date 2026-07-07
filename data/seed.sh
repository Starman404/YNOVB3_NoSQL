#!/bin/bash
# Lance le script de seed (le backend doit tourner sur localhost:3000)
cd "$(dirname "$0")/.."
npx ts-node data/seed.ts
