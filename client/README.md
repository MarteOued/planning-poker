# Planning Poker - Application Frontend

Une application web moderne de Planning Poker pour l'estimation collaborative de projets en équipe, avec synchronisation en temps réel.

---

## Table des Matières

- À Propos du Projet
- Fonctionnalités Principales
- Technologies Utilisées
- Installation et Configuration
- Démarrage de l'Application
- Guide d'Utilisation
- Structure du Projet
- Commandes Disponibles
- Configuration Avancée
- Résolution des Problèmes
- Déploiement

---

## À Propos du Projet

Planning Poker est une application collaborative qui permet aux équipes agiles d'estimer la complexité de leurs fonctionnalités en temps réel. L'application utilise la méthode Planning Poker où chaque membre de l'équipe vote anonymement avec des cartes de valeurs Fibonacci.

### Pourquoi utiliser cette application ?

L'application facilite l'estimation collaborative en permettant à toute l'équipe de participer simultanément, peu importe où se trouvent les membres. Le système de vote anonyme évite les biais et encourage une participation équitable de tous les membres.

---

## Fonctionnalités Principales

### Système de Vote

L'application propose un jeu de cartes basé sur la suite de Fibonacci : 0, 1, 2, 3, 5, 8, 13, 20, 40, 100. Deux cartes spéciales sont disponibles : le point d'interrogation pour exprimer une incertitude, et la tasse de café pour proposer une pause.

### Modes de Jeu

Deux modes sont disponibles selon les préférences de l'équipe :

Le mode Strict exige l'unanimité à chaque tour de vote. Si les votes ne sont pas unanimes, un nouveau tour est lancé jusqu'à ce que tout le monde soit d'accord.

Le mode Moyenne demande l'unanimité au premier tour uniquement. Si celle-ci n'est pas atteinte, les tours suivants utilisent la moyenne des votes pour déterminer l'estimation finale.

### Gestion des Sessions

Le Product Manager crée une session et reçoit un code unique à 6 caractères. Les membres de l'équipe utilisent ce code pour rejoindre la session. Le PM définit le nombre maximum de participants (entre 2 et 20 joueurs) et choisit le mode de vote avant de démarrer.

### Fonctionnalités en Temps Réel

Un chronomètre synchronisé permet à tous les participants de voir le temps écoulé. Le PM peut définir un objectif de temps qui déclenche une alerte automatique. Un système de chat permet aux participants de communiquer durant les estimations.

### Pause et Reprise

Quand tous les joueurs votent pour la carte café, la session est automatiquement mise en pause et sauvegardée. Un fichier JSON est généré contenant toutes les données de la session. Le PM peut reprendre la session plus tard en chargeant ce fichier.

### Export des Résultats

À la fin de la session, le PM peut télécharger un fichier JSON contenant toutes les estimations, les votes détaillés, et les statistiques de chaque fonctionnalité.

---

## Technologies Utilisées

### Framework et Outils de Build

React version 18 est utilisé comme framework principal pour construire l'interface utilisateur. Vite sert d'outil de build et de développement, offrant un démarrage rapide et un rechargement instantané.

### Styles et Design

TailwindCSS fournit les styles avec une approche utility-first. Framer Motion gère les animations et transitions fluides de l'interface.

### Communication

Socket.io assure la communication en temps réel entre tous les participants via WebSocket, permettant une synchronisation instantanée des votes et des actions.

### Gestion d'État

Zustand gère l'état global de l'application de manière simple et performante, sans la complexité de Redux.

### Navigation

React Router version 6 gère la navigation entre les différentes pages de l'application.

---

## Installation et Configuration

### Prérequis

Avant de commencer, vous devez avoir installé Node.js version 18 ou supérieure et npm version 9 ou supérieure sur votre machine.

### Étapes d'Installation

Premièrement, clonez le projet depuis le dépôt Git et naviguez dans le dossier frontend.

Ensuite, installez toutes les dépendances nécessaires en exécutant la commande suivante dans votre terminal :

    npm install

Cette commande télécharge et installe tous les packages requis listés dans le fichier package.json.

### Configuration des Variables d'Environnement

Créez un fichier nommé .env.local à la racine du dossier client. Ce fichier contiendra les configurations spécifiques à votre environnement.

Ajoutez les variables suivantes dans ce fichier :

La variable VITE_API_URL doit pointer vers l'URL de votre backend, par défaut http://localhost:3001

La variable VITE_SOCKET_URL doit également pointer vers l'URL du serveur Socket.io, généralement la même que l'API.

La variable VITE_APP_NAME définit le nom de votre application, par exemple "Planning Poker".

---

## Démarrage de l'Application

### Mode Développement

Pour lancer l'application en mode développement avec rechargement automatique, utilisez :

    npm run dev

L'application sera accessible à l'adresse http://localhost:5173

Le serveur de développement se recharge automatiquement à chaque modification du code, vous permettant de voir vos changements instantanément.

### Mode Production

Pour créer une version optimisée de l'application pour la production :

    npm run build

Cette commande génère les fichiers optimisés dans le dossier dist.

Pour prévisualiser le build de production localement :

    npm run preview

---

## Guide d'Utilisation

### Pour le Product Manager

#### Création d'une Session

Depuis la page d'accueil, cliquez sur "Créer une Session". Remplissez le formulaire avec les informations suivantes :

Votre pseudo qui sera visible par tous les participants.

Le nombre de joueurs maximum qui pourront rejoindre la session.

Le mode de vote : Strict pour l'unanimité obligatoire, ou Moyenne pour un calcul automatique après le premier tour.

Importez un fichier JSON contenant votre backlog de fonctionnalités à estimer.

Après validation, vous recevez un code unique à 6 caractères.

#### Partage du Code

Dans la salle d'attente, copiez le code de session affiché en haut de l'écran. Partagez ce code avec les membres de votre équipe par votre moyen de communication habituel.

#### Démarrage de la Session

Attendez que tous les joueurs aient rejoint la session. Vous voyez en temps réel qui est connecté. Quand tout le monde est prêt, cliquez sur "Démarrer la Session".

#### Gestion des Votes

Pour chaque fonctionnalité, sélectionnez votre carte et validez votre vote. Une fois que tous les participants ont voté, les résultats s'affichent automatiquement avec les statistiques.

Vous avez alors trois options :

Passer à la fonctionnalité suivante si l'estimation est validée.

Lancer un nouveau tour de vote si vous souhaitez rediscuter l'estimation.

Prendre une pause café en votant tous avec la carte café.

#### Fin de Session

Quand toutes les fonctionnalités sont estimées, un écran de résumé s'affiche. Cliquez sur "Télécharger les Résultats" pour obtenir un fichier JSON complet. Ensuite, cliquez sur "Terminer" pour clore la session.

### Pour les Joueurs

#### Rejoindre une Session

Depuis la page d'accueil, cliquez sur "Rejoindre une Session". Entrez votre pseudo et le code de session fourni par le PM. Cliquez sur "Rejoindre".

#### Phase d'Attente

Dans la salle d'attente, vous voyez les autres participants connectés. Attendez que le PM démarre la session.

#### Vote

Pour chaque fonctionnalité, lisez la description affichée. Sélectionnez la carte correspondant à votre estimation de complexité. Cliquez sur "Valider mon Vote". Attendez que tous les autres joueurs votent.

#### Consultation des Résultats

Une fois tous les votes soumis, les cartes sont révélées. Vous voyez les votes de chaque participant et les statistiques calculées. Attendez que le PM décide de passer à la suite ou de refaire un tour.

---

## Structure du Projet

### Organisation des Dossiers

Le dossier public contient tous les fichiers statiques comme le favicon.

Le dossier src contient tout le code source de l'application.

### Composants

Les composants sont organisés en deux catégories :

Les composants UI dans src/components/ui sont réutilisables dans toute l'application. On y trouve Button pour les boutons, Card pour les conteneurs, et Input pour les champs de saisie.

Les composants Game dans src/components/game sont spécifiques au jeu. VotingCard affiche les cartes de vote, Timer gère le chronomètre, et Chat permet la communication.

### Pages

Le dossier src/pages contient toutes les pages de l'application :

HomePage est la page d'accueil avec les deux options principales.

PMSetupPage permet au PM de configurer une nouvelle session.

JoinSessionPage permet aux joueurs de rejoindre une session existante.

WaitingRoom est la salle d'attente avant le démarrage.

GameRoom est la salle de jeu principale où se déroulent les votes.

### Gestion d'État

Le fichier sessionStore.js dans src/stores utilise Zustand pour gérer l'état global de l'application, stockant les informations de session, l'identité des utilisateurs, et les données de jeu.

### Utilitaires

Le fichier socket.js dans src/utils configure et exporte les fonctions de connexion Socket.io.

### Fichiers Racine

App.jsx est le composant principal qui configure le routeur et la structure de base.

main.jsx est le point d'entrée de l'application qui monte React dans le DOM.

index.css contient les styles globaux et la configuration Tailwind.

---

## Commandes Disponibles

### Développement

Lancer le serveur de développement :

    npm run dev

Cette commande démarre Vite en mode développement avec rechargement à chaud.

### Build

Créer une version de production :

    npm run build

Cette commande compile et optimise l'application pour la production.

Prévisualiser le build :

    npm run preview

Cette commande lance un serveur local pour tester le build de production.

### Tests

Lancer tous les tests en mode interactif :

    npm test

Exécuter les tests une seule fois :

    npm run test:run

Générer un rapport de couverture de code :

    npm run test:coverage

Ouvrir l'interface de test interactive :

    npm run test:ui

### Maintenance

Nettoyer le cache de Vite :

    npm run dev -- --force

Réinstaller toutes les dépendances :

    npm ci

---

## Configuration Avancée

### Personnalisation du Port

Si le port 5173 est déjà utilisé, modifiez le fichier vite.config.js pour changer le port par défaut.

### Proxy API

Le fichier vite.config.js peut être configuré pour rediriger les appels API vers le backend, évitant ainsi les problèmes de CORS en développement.

### Personnalisation des Couleurs

Les couleurs de l'application peuvent être modifiées dans le fichier tailwind.config.js. Vous y trouverez la palette de couleurs principales que vous pouvez adapter à votre charte graphique.

### Configuration Socket.io

Le fichier src/utils/socket.js contient la configuration Socket.io. Vous pouvez y ajuster les options de reconnexion, les timeouts, et autres paramètres de connexion.

---

## Résolution des Problèmes

### Le serveur ne démarre pas

Si vous obtenez une erreur au démarrage, vérifiez d'abord que Node.js est bien installé en version 18 ou supérieure. Ensuite, supprimez le dossier node_modules et le fichier package-lock.json, puis réinstallez les dépendances.

### Socket.io ne se connecte pas

Assurez-vous que le serveur backend est bien lancé et accessible. Vérifiez que l'URL dans le fichier .env.local correspond bien à l'adresse du serveur. Contrôlez également que les ports ne sont pas bloqués par un pare-feu.

### Les cartes ne s'affichent pas correctement

Effacez le cache du navigateur en appuyant sur Ctrl+Shift+R ou Cmd+Shift+R sur Mac. Si le problème persiste, supprimez le dossier .vite dans node_modules et redémarrez le serveur.

### Erreur lors du build

Vérifiez qu'il n'y a pas d'erreurs de syntaxe dans votre code. Assurez-vous que toutes les dépendances sont bien installées. Essayez de nettoyer complètement le projet et de réinstaller.

### Le port est déjà utilisé

Si le port 5173 est occupé par une autre application, vous pouvez soit arrêter l'autre application, soit changer le port dans la configuration Vite.

### Problèmes de performances

Si l'application est lente, vérifiez votre connexion internet car Socket.io nécessite une connexion stable. Fermez les onglets inutiles du navigateur qui peuvent consommer de la mémoire. Essayez de redémarrer le serveur de développement.

---

## Déploiement

### Préparation

Avant de déployer, assurez-vous que toutes les variables d'environnement sont correctement configurées pour la production. Créez un build de production et testez-le localement avec la commande preview.

### Déploiement sur Vercel

Vercel offre un déploiement gratuit et automatique. Installez la CLI Vercel globalement, puis lancez la commande vercel dans votre terminal. Suivez les instructions à l'écran pour configurer votre projet. Pour déployer en production, utilisez la commande vercel avec l'option --prod.

### Déploiement sur Netlify

Netlify est une autre plateforme gratuite de déploiement. Connectez votre dépôt Git à Netlify. Configurez la commande de build comme "npm run build" et le dossier de publication comme "dist". Ajoutez vos variables d'environnement dans les paramètres Netlify.

### Déploiement avec Docker

Si vous préférez Docker, créez un fichier Dockerfile à la racine du projet. Construisez l'image Docker avec la commande docker build. Lancez le conteneur avec docker run en exposant le port approprié.

### Configuration Post-Déploiement

Après le déploiement, vérifiez que l'application se connecte bien au backend en production. Testez toutes les fonctionnalités principales pour vous assurer qu'elles fonctionnent correctement. Configurez un nom de domaine personnalisé si nécessaire.

---

## Support et Contact

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur le dépôt GitHub du projet. Vous pouvez également consulter la documentation complète dans le wiki du projet.

---

Fait avec passion pour faciliter l'estimation agile en équipe.