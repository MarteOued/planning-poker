#!/bin/bash
# Script de déploiement complet

echo " Déploiement Planning Poker..."

# 1. Tests
echo " Exécution des tests..."
cd server && npm run test:coverage
cd ../client && npm run test:coverage

# 2. Build
echo " Build des applications..."
cd ../server && npm ci
cd ../client && npm ci && npm run build

# 3. Documentation
echo " Génération documentation..."
cd ../server && npm run docs
cd ../client && npm run docs

echo " Déploiement prêt!"
echo " Rapports disponibles dans:"
echo "   - server/coverage/"
echo "   - client/coverage/"
echo "   - server/docs/"