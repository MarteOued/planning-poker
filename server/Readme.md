Planning Poker - Backend
Serveur backend de l'application 

Planning Poker développé avec Node.js et Socket.io pour gérer les sessions de vote en temps réel.

Installation
Installer les dépendances du projet

npm install

Démarrage du serveur
Démarre le serveur avec rechargement automatique lors des modifications de code :

npm run dev

Le serveur se lance sur le port 5000 par défaut (configurable via la variable d'environnement PORT).

Mode production
Démarre le serveur en mode production :

npm start

Exécution des tests

Lance l'ensemble de la suite de tests avec rapport de couverture :

npm test

Mode surveillance
Lance les tests en mode watch pour développement continu :

npm run test:watch

Les tests se relancent automatiquement à chaque modification de fichier.

Rapport de couverture détaillé
Génère un rapport HTML complet de la couverture de code :

npm run test:coverage
Le rapport sera disponible dans le dossier coverage/.

Documentation technique
Génère la documentation JSDoc du code source :

npm run docs

La documentation est créée dans le dossier docs/.

Consultation de la documentation
Génère et ouvre automatiquement la documentation dans le navigateur :

npm run docs:serve

La documentation sera accessible à l'adresse http://localhost:8080
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

Node.js - Environnement d'exécution JavaScript
Express - Framework web minimaliste
Socket.io - Bibliothèque de communication temps réel bidirectionnelle
Jest - Framework de tests unitaires et d'intégration
JSDoc - Outil de génération de documentation à partir du code
Multer - Middleware de gestion d'upload de fichiers

API WebSocket
Le serveur expose les événements Socket.io suivants :
Événements entrants (client vers serveur)

create-session - Création d'une nouvelle session de vote
join-session - Ajout d'un joueur à une session existante
load-backlog - Chargement d'un backlog de fonctionnalités
submit-vote - Soumission du vote d'un joueur
start-new-round - Démarrage d'un nouveau tour de vote
next-feature - Passage à la fonctionnalité suivante
save-session - Sauvegarde de la session en cours (carte café)
export-results - Export des résultats au format JSON

Événements sortants (serveur vers client)

session-created - Confirmation de création de session
player-joined - Notification d'arrivée d'un joueur
player-left - Notification de départ d'un joueur
backlog-loaded - Confirmation de chargement du backlog
vote-recorded - Confirmation d'enregistrement d'un vote
all-voted - Tous les joueurs ont voté
new-round - Nouveau tour démarré
backlog-completed - Toutes les fonctionnalités ont été estimées

API REST
Le serveur expose également une API REST pour les opérations non temps réel.
Gestion des sessions

GET /api/sessions - Récupère la liste des sessions actives
GET /api/sessions/:code - Récupère les détails d'une session spécifique
DELETE /api/sessions/:id - Supprime une session terminée

Gestion des fichiers

POST /api/files/upload-backlog - Upload d'un fichier JSON de backlog
GET /api/files/saved-sessions - Liste des sessions sauvegardées
GET /api/files/saved-sessions/:fileName - Chargement d'une session sauvegardée
POST /api/files/download-results - Téléchargement des résultats au format JSON
POST /api/files/clean-old-sessions - Nettoyage des anciennes sauvegardes

Configuration
Le serveur utilise les variables d'environnement suivantes (fichier .env) :
PORT=5000                              # Port d'écoute du serveur
NODE_ENV=development                   # Environnement (development/production)
CORS_ORIGIN=http://localhost:3000     # Origine autorisée pour CORS
Format des données
Backlog JSON
Le serveur accepte deux formats de backlog :
Format objet :
json{
  "features": [
    {
      "id": "US-001",
      "title": "Fonctionnalité 1",
      "description": "Description détaillée"
    }
  ]
}