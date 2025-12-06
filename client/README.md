Planning Poker - Frontend React
https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E
https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white

Application web de Planning Poker en temps réel pour l'estimation agile des fonctionnalités.

📋 Fonctionnalités
🎯 Modes de Jeu
Mode Strict : Unanimité requise pour chaque estimation

Mode Moyenne : 1er tour unanimité, puis moyenne des tours suivants

👥 Gestion des Sessions
Création de session par Product Manager (PM)

Rejoindre une session avec code

Limite configurable de joueurs (2-10)

Interface de salle d'attente en temps réel

🃏 Système de Vote
Cartes Fibonacci : 0, 1, 2, 3, 5, 8, 13, 20, 40, 100

Cartes spéciales : "?" (Incertitude), "☕" (Pause café)

Interface de vote intuitive avec animations

Votes révélés simultanément

📊 Résultats & Analyse
Affichage des votes de tous les joueurs

Calcul automatique : moyenne, médiane, min, max

Historique des estimations

Export JSON des résultats

⏱️ Fonctionnalités Avancées
Timer synchronisé entre tous les joueurs

Chat en temps réel

Pause café automatique avec sauvegarde

Backlog import/export JSON

Reprise de session avec fichier de sauvegarde

🚀 Installation
Prérequis
Node.js 18+ et npm

Installation
bash
# Clonez le projet
git clone <votre-repo>
cd planning-poker/client

# Installez les dépendances
npm install
🏃 Démarrage
Développement
bash
# Démarrez le serveur de développement
npm run dev

# L'application sera disponible sur :
# http://localhost:5173
Production
bash
# Build pour production
npm run build

# Prévisualisez le build
npm run preview
🧪 Tests
Suite de Tests
bash
# Exécutez tous les tests en mode watch
npm test

# Exécutez les tests une fois
npm run test:run

# Exécutez les tests avec coverage
npm run test:coverage

# Interface UI pour les tests
npm run test:ui

# Générer le rapport HTML de coverage
npm run coverage:report
Structure des Tests
text
src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   └── Button.test.jsx          # 18 tests ✓
│   └── game/
│       ├── VotingCard.jsx
│       └── VotingCard.test.jsx      # 21 tests ✓
├── stores/
│   ├── sessionStore.js
│   └── sessionStore.test.js         # 12 tests ✓
├── pages/
│   ├── GameRoom.jsx
│   └── GameRoom.test.jsx            # 2 tests ✓
└── test/
    ├── setup.js                     # Configuration des tests
    └── mocks/                       # Mocks pour les tests
Couverture de Code
53 tests unitaires exécutés avec succès

Rapports générés dans coverage/

Couverture sur composants critiques :

sessionStore.js : 100% ✓

VotingCard.jsx : 100% ✓

Button.jsx : 57% ✓

📁 Structure du Projet
text
client/
├── src/
│   ├── components/          # Composants React
│   │   ├── ui/             # Composants d'interface génériques
│   │   ├── game/           # Composants spécifiques au jeu
│   │           
│   ├── pages/              # Pages de l'application
│   │   ├── Home.jsx        # Page d'accueil
│   │   ├── CreateSession.jsx
│   │   ├── JoinSession.jsx
│   │   ├── WaitingRoom.jsx
│   │   └── GameRoom.jsx    # Salle de jeu principale
│   ├── stores/             # State management (Zustand)
│   │   └── sessionStore.js # Store global de session
│   ├── utils/              # Utilitaires
│   │   ├── socket.js       # Configuration Socket.io  
│   ├── hooks/              # Custom React hooks
│   ├── test/               # Configuration des tests
│   │   ├── setup.js
│   │   └── mocks/
│   └── App.jsx             # Composant racine
├── public/                 # Fichiers statiques
│   └── cartes/             # Images des cartes
├── coverage/              # Rapports de coverage (généré)
├── vite.config.js         # Configuration Vite
├── vitest.config.js       # Configuration Vitest
├── jsdoc.config.json      # Configuration documentation
└── package.json
🔧 Configuration
Variables d'Environnement
bash
# Créez un fichier .env.local
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Planning Poker
Configuration Vite
javascript
// vite.config.js
export default {
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}
🔌 Connexion au Backend
Socket.io Events
Événement	Direction	Description
join-session	Client → Serveur	Rejoindre une session
submit-vote	Client → Serveur	Soumettre un vote
vote-updated	Serveur → Client	Mise à jour des votes
all-voted	Serveur → Client	Tous les joueurs ont voté
new-round-started	Serveur → Client	Nouveau tour démarré
API REST
javascript
// Créer une session
POST http://localhost:3001/api/sessions/create
{
  "userName": "Product Manager",
  "playerCount": 4,
  "mode": "strict",
  "features": [...]
}
🎨 Design System
Couleurs
css
--primary: #3B82F6;    /* Blue-500 */
--secondary: #8B5CF6;  /* Purple-500 */
--success: #10B981;    /* Emerald-500 */
--danger: #EF4444;     /* Red-500 */
--warning: #F59E0B;    /* Amber-500 */
Typographie
Titres : Inter, 700

Corps : Inter, 400

Code : JetBrains Mono, 400

📱 Composants Principaux
Button.jsx
jsx
<Button 
  variant="primary" // primary, secondary, danger, success, warning, ghost
  size="md"         // sm, md, lg
  fullWidth={false}
  disabled={false}
  onClick={handleClick}
>
  Cliquer ici
</Button>
VotingCard.jsx
jsx
<VotingCard
  value={8}          // 0,1,2,3,5,8,13,20,40,100,?,☕
  isSelected={false}
  isDisabled={false}
  onClick={handleSelect}
/>
🗃️ State Management
sessionStore.js (Zustand)
javascript
const useSessionStore = create((set) => ({
  // État
  sessionId: null,
  isPM: false,
  userName: '',
  features: [],
  
  // Actions
  setSessionId: (id) => set({ sessionId: id }),
  setIsPM: (isPM) => set({ isPM }),
  setFeatures: (features) => set({ features }),
  reset: () => set({ sessionId: null, isPM: false, userName: '' })
}))
🔍 Débogage
Logs de Développement
bash
# Activez les logs détaillés
localStorage.setItem('debug', 'planning-poker:*')

# Voir les logs Socket.io
localStorage.setItem('debug', 'socket.io:*')
DevTools
React DevTools : Inspection des composants

Redux DevTools : Inspection du store Zustand

Socket.io DevTools : Monitorer les événements

🐛 Dépannage
Problèmes Courants
Problème : Socket.io ne se connecte pas

bash
# Solution : Vérifiez que le backend tourne
cd ../server
npm start
Problème : Les tests échouent

bash
# Solution : Nettoyez le cache
rm -rf coverage node_modules/.vite
npm install
npm test
Problème : Build échoue

bash
# Solution : Vérifiez les dépendances
npm ci
npm run build
📈 Performance
Optimisations
Code Splitting : Chargement lazy des routes

Tree Shaking : Elimination du code mort

Image Optimization : Compression automatique

Bundle Analysis : npm run build -- --report

Métriques
First Contentful Paint : < 1.5s

Time to Interactive : < 3s

Bundle Size : < 500KB gzipped

🔒 Sécurité
Bonnes Pratiques
Validation des inputs côté client et serveur

Sanitization des messages du chat

Protection XSS avec React

Headers de sécurité CSP

Sécurité Socket.io
javascript
// Authentification des connexions
socket.on('join-session', ({ sessionId, token }) => {
  if (!verifyToken(token)) {
    socket.disconnect()
  }
})
🌐 Déploiement
Vercel
bash
# Installation de Vercel CLI
npm i -g vercel

# Déploiement
vercel
Netlify
bash
# Build command
npm run build

# Publish directory
dist
Docker
dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
📚 Documentation
Génération de la Documentation
bash
# Générer la documentation JSDoc
npm run docs

# La documentation sera disponible dans docs/
Standards de Code
javascript
/**
 * @component Button
 * @description Bouton personnalisé avec variantes
 * @param {Object} props - Les propriétés du bouton
 * @param {string} [props.variant="primary"] - Variante
 * @returns {JSX.Element} Élément bouton React
 */
🤝 Contribution
Workflow Git
bash
# 1. Fork le projet
# 2. Créez une branche
git checkout -b feature/nouvelle-fonctionnalite

# 3. Committez vos changements
git commit -m "feat: ajoute nouvelle fonctionnalité"

# 4. Push vers la branche
git push origin feature/nouvelle-fonctionnalite

# 5. Créez une Pull Request
Conventions de Commit
feat: : Nouvelle fonctionnalité

fix: : Correction de bug

docs: : Documentation

test: : Tests

refactor: : Refactorisation

style: : Formatage