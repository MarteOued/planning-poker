                                                                     Planning Poker - Application Web

Application collaborative de Planning Poker permettant l'estimation de fonctionnalités en équipe selon les méthodes agiles.

Description

Planning Poker est une application web temps réel permettant à plusieurs joueurs d'estimer la complexité de fonctionnalités d'un backlog de manière collaborative. L'application supporte deux modes de jeu et propose une interface intuitive avec des cartes de planning poker authentiques.

Fonctionnalités principales

Création et jonction de sessions distantes via code unique
Communication temps réel entre les joueurs (WebSocket)
Deux modes de validation des estimations : Strict (unanimité) et Moyenne
Import et export de backlog au format JSON
Système de pause collaboratif avec sauvegarde automatique
Historique complet des votes et statistiques
Tests automatisés et documentation complète

Technologies utilisées
Backend

Node.js avec Express 
Socket.io pour la communication temps réel
Jest pour les tests unitaires et d'intégration
JSDoc pour la génération automatique de documentation

Frontend

React 18 pour l'interface utilisateur
React Router pour la navigation
Socket.io-client pour la communication avec le serveur
Tailwind CSS pour le style moderne et responsive
CSS pour le design responsive

Installation
Prérequis

Node.js version 18 ou supérieure
npm version 9 ou supérieure
Git

Étapes d'installation

Cloner le repository
git clone https://github.com/nomUser/planning-poker.git
cd planning-poker

Installer et démarrer le backend

cd server
npm install
npm run dev
Le serveur démarre sur http://localhost:5000

Installer et démarrer le frontend (dans un nouveau terminal)

cd client
npm install
npm start

L'application s'ouvre automatiquement sur http://localhost:3000

Utilisation

1. Créer une nouvelle session
- Accéder à l'application
- Entrer votre pseudo
- Sélectionner le mode de jeu souhaité
- Cliquer sur "Créer une session"
- Partager le code de session généré avec les autres participants

2. Rejoindre une session existante

- Obtenir le code de session auprès de l'organisateur
- Entrer votre pseudo
- Saisir le code de session
- Cliquer sur "Rejoindre"

Charger un backlog
Exemple: 
L'organisateur de la session peut charger un backlog au format JSON :
json{
  "features": [
    {
      "id": "US-001",
      "title": "Authentification utilisateur",
      "description": "Permettre la connexion par email et mot de passe"
    },
    {
      "id": "US-002",
      "title": "Dashboard principal",
      "description": "Afficher les statistiques de l'utilisateur"
    }
  ]
}

Processus de vote

Chaque joueur sélectionne une carte correspondant à son estimation
Une fois que tous les joueurs ont voté, les résultats sont révélés
Selon le mode choisi, l'estimation est validée ou un nouveau tour commence
Le processus se répète pour chaque fonctionnalité du backlog

Export des résultats
À la fin de la session, téléchargez automatiquement un fichier JSON contenant :

Toutes les fonctionnalités estimées
Les votes de chaque tour
Les statistiques globales de la session

Modes de jeu

Mode Strict (Unanimité)

Tous les joueurs doivent voter la même valeur
En cas de désaccord, un nouveau tour de vote est lancé
Favorise la discussion et le consensus d'équipe

Mode Moyenne

Premier tour obligatoirement à l'unanimité pour assurer une discussion initiale
Tours suivants : calcul automatique de la moyenne des votes
Arrondi à la valeur Fibonacci la plus proche

Fonctionnalité Pause Café

Lorsque tous les joueurs sélectionnent la carte "Café" :

La session est automatiquement sauvegardée dans un fichier JSON
Les joueurs peuvent quitter l'application
La partie peut être reprise ultérieurement en important le fichier de sauvegarde

Tests et qualité du code
Exécuter les tests

Backend :
cd server
npm test
npm run test:coverage

Frontend :
cd client
npm test

Générer la documentation

cd server
npm run docs
La documentation sera disponible dans server/docs/index.html

Intégration Continue

Le projet utilise GitHub Actions pour automatiser :
- Lancer les tests automatiquement
- Générer la documentation
- Calculer le coverage
- Vérifier la qualité du code
Configuration disponible dans .github/workflows/ci-cd.yml

Dépannage

Le serveur ne démarre pas
Vérifier que le port 5000 n'est pas déjà utilisé. Pour changer le port :
bashexport PORT=3001
npm run dev

Erreur de connexion WebSocket
Vérifier que le backend est bien démarré et que l'URL dans le fichier de configuration client correspond au serveur.

Tests en échec
Supprimer les dépendances et réinstaller :
rm -rf node_modules package-lock.json
npm install

Auteurs

- Ouedraogo Martine - Développement backend, WebSocket, tests et intégration continue
- Ndiaye Aida - Développement frontend, interface utilisateur et documentation

Projet réalisé dans le cadre du cours de Conception agile - Université Lumière Lyon 2
