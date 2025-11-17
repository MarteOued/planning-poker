Planning Poker - Backend

Serveur backend de l'application Planning Poker développé avec Node.js et Socket.io pour gérer les sessions de vote en temps réel.

Installation

Installer les dépendances du projet :

npm install

Démarrage du serveur

Mode développement (avec rechargement automatique) :

npm run dev


Le serveur se lance sur le port 5000 par défaut (modifiable via la variable d'environnement PORT).

Mode production :

npm start

Tests

Exécution de la suite complète :

npm test


Mode surveillance (watch) :

npm run test:watch


Rapport de couverture détaillé :

npm run test:coverage


Le rapport HTML sera disponible dans le dossier coverage/.

Documentation

Génération de la documentation JSDoc :

npm run docs


Consulter la documentation dans le navigateur :

npm run docs:serve


Accessible par défaut à : http://localhost:8080

---
Architecture du projet

```
server/
├── src/
│   ├── models/            # Classes métier (Session, Feature, Vote, Player)
│   ├── managers/          # Logique métier (SessionManager, BacklogManager, etc.)
│   ├── utils/             # Fonctions utilitaires et validateurs
│   ├── socket/            # Gestionnaires WebSocket
│   └── routes/            # Routes API REST
├── tests/
│   ├── unit/              # Tests unitaires
│   └── integration/       # Tests d'intégration
├── docs/                  # Documentation JSDoc générée
├── coverage/              # Rapports de couverture de tests
├── data/                  # Données persistantes
│   ├── sessions/          # Sessions sauvegardées
│   └── exports/           # Export des résultats
└── server.js              # Point d'entrée de l'application
```

---

Stack technique

Node.js – environnement d’exécution JavaScript

Express – framework web minimaliste

Socket.io – communication temps réel bidirectionnelle

Jest – tests unitaires et d’intégration

JSDoc – génération de documentation

Multer – gestion des uploads de fichiers

API WebSocket
Événements entrants (client → serveur)

create-session – Créer une nouvelle session de vote

join-session – Ajouter un joueur à une session existante

load-backlog – Charger un backlog de fonctionnalités

submit-vote – Soumettre un vote

start-new-round – Démarrer un nouveau tour de vote

next-feature – Passer à la fonctionnalité suivante

save-session – Sauvegarder la session en cours (carte café)

export-results – Exporter les résultats au format JSON

Événements sortants (serveur → client)

session-created – Confirmation de création de session

player-joined – Notification d’arrivée d’un joueur

player-left – Notification de départ d’un joueur

backlog-loaded – Confirmation de chargement du backlog

vote-recorded – Confirmation d’enregistrement d’un vote

all-voted – Tous les joueurs ont voté

new-round – Nouveau tour démarré

backlog-completed – Toutes les fonctionnalités estimées

API REST
Gestion des sessions

GET /api/sessions – Liste des sessions actives

GET /api/sessions/:code – Détails d’une session

DELETE /api/sessions/:id – Supprimer une session

Gestion des fichiers

POST /api/files/upload-backlog – Upload d’un backlog JSON

GET /api/files/saved-sessions – Liste des sessions sauvegardées

GET /api/files/saved-sessions/:fileName – Charger une session sauvegardée

POST /api/files/download-results – Télécharger les résultats JSON

POST /api/files/clean-old-sessions – Nettoyer les anciennes sauvegardes

Configuration

Le serveur utilise un fichier .env :

PORT=5000                 # Port d'écoute
NODE_ENV=development       # Environnement (development/production)
CORS_ORIGIN=http://localhost:3000  # Origine autorisée pour CORS

Format des données – Backlog JSON
Exemple :
{
  "features": [
    {
      "id": "US-001",
      "title": "Fonctionnalité 1",
      "description": "Description détaillée"
    }
  ]
}
