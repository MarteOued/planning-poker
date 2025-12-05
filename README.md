# Planning Poker

Application collaborative de Planning Poker permettant l'estimation de fonctionnalités en équipe selon les méthodes agiles.

---

## Description

Planning Poker est une application web temps réel permettant à plusieurs joueurs d'estimer la complexité de fonctionnalités d'un backlog de manière collaborative. L'application supporte deux modes de jeu et propose une interface intuitive avec des cartes de planning poker authentiques.

---

## Fonctionnalités principales

- Création et jonction de sessions distantes via code unique
- Communication temps réel entre les joueurs (WebSocket)
- Deux modes de validation des estimations : Strict (unanimité) et Moyenne
- Import et export de backlog au format JSON
- Système de pause collaborative avec sauvegarde automatique
- Historique complet des votes et statistiques
- Tests automatisés et documentation complète

---

## Technologies utilisées

### Backend

- Node.js avec Express
- Socket.io pour la communication temps réel
- Jest pour les tests unitaires et d'intégration
- JSDoc pour la génération automatique de documentation

### Frontend

- React 18 pour l'interface utilisateur
- React Router pour la navigation
- Socket.io-client pour la communication avec le serveur
- Tailwind CSS pour le style moderne et responsive

---

## Installation

### Prérequis

- Node.js version 18 ou supérieure
- npm version 9 ou supérieure
- Git

### Étapes d'installation

**1. Cloner le dépôt**

```bash
git clone https://github.com/MarteOued/planning-poker.git
cd planning-poker
```

**2. Installer et démarrer le backend**

```bash
cd server
npm install
npm run dev
```

Le serveur démarre sur http://localhost:3001

**3. Installer et démarrer le frontend (dans un nouveau terminal)**

```bash
cd client
npm install
npm start
```

L'application s'ouvre automatiquement sur http://localhost:5173

---

## Utilisation

### Créer une nouvelle session

1. Accéder à l'application
2. Entrer votre pseudo
3. Sélectionner le mode de jeu souhaité et le nombre de joueur
4. Cliquer sur "Créer une session"
5. Partager le code de session généré avec les autres participants

### Rejoindre une session existante

1. Obtenir le code de session auprès de l'organisateur
2. Entrer votre pseudo
3. Saisir le code de session
4. Cliquer sur "Rejoindre"

### Charger un backlog

L'organisateur de la session peut charger un backlog au format JSON :

```json
{
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
```

Ou directement sous forme de tableau :

```json
[
  {
    "id": 1,
    "title": "Feature 1",
    "description": "Description..."
  }
]
```

### Processus de vote

1. Chaque joueur sélectionne une carte correspondant à son estimation
2. Une fois que tous les joueurs ont voté, les résultats sont révélés
3. Selon le mode choisi, l'estimation est validée ou un nouveau tour commence
4. Le processus se répète pour chaque fonctionnalité du backlog

### Export des résultats

À la fin de la session, téléchargez automatiquement un fichier JSON contenant :

- Toutes les fonctionnalités estimées
- Les votes de chaque tour
- Les statistiques globales de la session

---

## Modes de jeu

### Mode Strict (Unanimité)

- Tous les joueurs doivent voter la même valeur
- En cas de désaccord, un nouveau tour de vote est lancé
- Favorise la discussion et le consensus d'équipe

### Mode Moyenne

- Premier tour obligatoirement à l'unanimité pour assurer une discussion initiale
- Tours suivants : calcul automatique de la moyenne des votes
- Arrondi à la valeur Fibonacci la plus proche

---

## Fonctionnalité Pause Café

Lorsque tous les joueurs sélectionnent la carte "Café" :

- La session est automatiquement sauvegardée dans un fichier JSON
- Les joueurs peuvent quitter l'application
- La partie peut être reprise ultérieurement en important le fichier de sauvegarde

---

## Tests et qualité du code

### Exécuter les tests

**Backend :**
```bash
cd server
npm test
npm run test:coverage
```

**Frontend :**
```bash
cd client
npm test
```

### Générer la documentation

```bash
cd server
npm run docs
npm run docs:serve

```

La documentation sera disponible dans `server/docs/index.html`

---

## Intégration Continue

Le projet utilise GitHub Actions pour automatiser :

- L'exécution des tests unitaires sur plusieurs versions de Node.js
- La génération de la documentation technique
- Le calcul de la couverture de code
- La vérification de la qualité du code

Configuration disponible dans `.github/workflows/ci-cd.yml`

---

## Structure du projet

```
planning-poker/
├── .github/
│   └── workflows/           # Configuration CI/CD
│       └── ci-cd.yml
│
├── server/                  # Backend Node.js
│   ├── src/
│   │   ├── models/         # Classes métier
│   │   ├── managers/       # Logique métier
│   │   ├── socket/         # Gestionnaires WebSocket
│   │   
│   ├── tests/              # Tests Jest
│   ├── docs/               # Documentation générée
│   └── package.json
│
├── client/                  # Frontend React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── stores/       # Services (Socket, API)
│   │   └── utils/          # Constantes et helpers
│   ├── public/
│   └── package.json
│
├── data/                    # Données persistantes
│   ├── sessions/           # Sauvegardes de sessions
│   └── exports/            # Exports de résultats
│
└── README.md
```

---

## Dépannage

### Le serveur ne démarre pas

Vérifier que le port 3001 n'est pas déjà utilisé. Pour changer le port :

```bash
export PORT=3002
npm run dev
```

### Erreur de connexion WebSocket

Vérifier que le backend est bien démarré et que l'URL dans le fichier de configuration client correspond au serveur.

### Tests en échec

Supprimer les dépendances et réinstaller :

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Auteurs

- **Ouedraogo Martine** - Développement backend, WebSocket, tests et intégration continue
- **Ndiaye Aida** - Développement frontend, interface utilisateur et documentation

Projet réalisé dans le cadre du cours de Conception Agile - Université Lumière Lyon 2


---

## Licence

Ce projet est sous licence MIT.

---

## Liens utiles

- [Documentation Backend](./server/README.md)
- [Documentation Frontend](./client/README.md)
- [Guide de contribution](./CONTRIBUTING.md)
- [GitHub Actions](https://github.com/MarteOued/planning-poker/actions)
