/**
 * @module models/Session
 * @description Classe représentant une session de Planning Poker
 */
const { v4: uuidv4 } = require('uuid');

/**
 * Classe représentant une session de Planning Poker
 * @class Session
 */
class Session {
  /**
   * Constructeur de Session
   * @constructor
   * @param {string} organizerId - ID du joueur organisateur
   * @param {string} [mode='strict'] - Mode de jeu ('strict' ou 'moyen')
   * @example
   * const session = new Session('player-123', 'average');
   */
  constructor(organizerId, mode = 'strict') {
    /**
     * Identifiant unique de la session
     * @type {string}
     */
    this.id = uuidv4();
    
    /**
     * Code court pour rejoindre la session
     * @type {string}
     */
    this.code = this.generateCode();
    
    /**
     * Mode de jeu (strict ou moyen)
     * @type {string}
     */
    this.mode = mode;
    
    /**
     * ID de l'organisateur
     * @type {string}
     */
    this.organizerId = organizerId;
    
    /**
     * Liste des joueurs
     * @type {Array<Player>}
     */
    this.players = [];
    
    /**
     * Backlog des fonctionnalités
     * @type {Array<Feature>}
     */
    this.backlog = [];
    
    /**
     * Index de la fonctionnalité en cours
     * @type {number}
     */
    this.currentFeatureIndex = 0;
    
    /**
     * Statut de la session (waiting, playing, completed)
     * @type {string}
     */
    this.status = 'waiting';
    
    /**
     * Date de création
     * @type {Date}
     */
    this.createdAt = new Date();
  }

  /**
   * Génère un code de session aléatoire à 6 caractères
   * @private
   * @returns {string} Code de session
   * @example
   * // Retourne quelque chose comme 'A7B3C9'
   */
  generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Ajoute un joueur à la session
   * @param {Player} player - Joueur à ajouter
   * @throws {Error} Si le pseudo est déjà utilisé
   * @returns {boolean} True si le joueur a été ajouté
   * @example
   * session.addPlayer(new Player('socket-123', 'Alice'));
   */
  addPlayer(player) {
    const pseudoExists = this.players.some(p => p.pseudo === player.pseudo);
    
    if (pseudoExists) {
      throw new Error('Ce pseudo est déjà utilisé');
    }
    
    this.players.push(player);
    return true;
  }

  /**
   * Supprime un joueur de la session
   * @param {string} playerId - ID du joueur à supprimer
   * @returns {boolean} True si le joueur a été supprimé
   * @example
   * session.removePlayer('socket-123');
   */
  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId);
    
    if (index === -1) {
      return false;
    }
    
    this.players.splice(index, 1);
    return true;
  }

  /**
   * Charge un backlog de fonctionnalités
   * @param {Array<Object>} features - Tableau de fonctionnalités
   * @throws {Error} Si le backlog est vide
   * @returns {void}
   * @example
   * session.loadBacklog([
   *   { id: 'US-001', name: 'Feature 1' },
   *   { id: 'US-002', name: 'Feature 2' }
   * ]);
   */
  loadBacklog(features) {
    if (!features || features.length === 0) {
      throw new Error('Le backlog ne peut pas être vide');
    }
    
    this.backlog = features;
    this.currentFeatureIndex = 0;
  }

  /**
   * Récupère la fonctionnalité actuellement en cours d'estimation
   * @returns {Feature|null} La fonctionnalité courante ou null si terminé
   * @example
   * const feature = session.getCurrentFeature();
   */
  getCurrentFeature() {
    if (this.currentFeatureIndex >= this.backlog.length) {
      return null;
    }
    
    return this.backlog[this.currentFeatureIndex];
  }

  /**
   * Passe à la fonctionnalité suivante
   * @returns {Feature|null} La prochaine fonctionnalité ou null si terminé
   * @example
   * const nextFeature = session.nextFeature();
   */
  nextFeature() {
    this.currentFeatureIndex++;
    
    if (this.currentFeatureIndex >= this.backlog.length) {
      this.status = 'completed';
      return null;
    }
    
    return this.getCurrentFeature();
  }

  /**
   * Démarre la session de Planning Poker
   * @throws {Error} Si aucun backlog n'est chargé
   * @throws {Error} Si moins de 2 joueurs
   * @returns {void}
   * @example
   * session.start();
   */
  start() {
    if (this.backlog.length === 0) {
      throw new Error('Aucun backlog chargé');
    }
    
    if (this.players.length < 2) {
      throw new Error('Au moins 2 joueurs sont nécessaires');
    }
    
    this.status = 'playing';
  }

  /**
   * Vérifie si la session est terminée
   * @returns {boolean} True si toutes les fonctionnalités ont été estimées
   * @example
   * if (session.isCompleted()) {
   *   console.log('Session terminée !');
   * }
   */
  isCompleted() {
    return this.currentFeatureIndex >= this.backlog.length;
  }

  /**
   * Réinitialise la session
   * @returns {void}
   * @example
   * session.reset();
   */
  reset() {
    this.currentFeatureIndex = 0;
    this.status = 'waiting';
    this.backlog.forEach(feature => {
      if (feature.reset) {
        feature.reset();
      }
    });
  }

  /**
   * Calcule la progression de la session
   * @returns {Object} Objet contenant le nombre total et complété
   * @returns {number} return.total - Nombre total de fonctionnalités
   * @returns {number} return.completed - Nombre de fonctionnalités complétées
   * @returns {number} return.percentage - Pourcentage de progression
   * @example
   * const progress = session.getProgress();
   * console.log(`Progression: ${progress.percentage}%`);
   */
  getProgress() {
    const total = this.backlog.length;
    const completed = this.currentFeatureIndex;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      percentage
    };
  }

  /**
   * Convertit la session en objet JSON
   * @param {boolean} [includeDetails=true] - Inclure les détails complets
   * @returns {Object} Représentation JSON de la session
   * @example
   * const json = session.toJSON();
   * console.log(json);
   */
  toJSON(includeDetails = true) {
    const base = {
      id: this.id,
      code: this.code,
      mode: this.mode,
      status: this.status,
      playersCount: this.players.length,
      createdAt: this.createdAt
    };
    
    if (includeDetails) {
      return {
        ...base,
        players: this.players.map(p => p.toJSON ? p.toJSON() : p),
        backlog: this.backlog.map(f => f.toJSON ? f.toJSON() : f),
        currentFeatureIndex: this.currentFeatureIndex,
        progress: this.getProgress()
      };
    }
    
    return base;
  }
}

module.exports = Session;