/**
 * Classe représentant un joueur dans une session de Planning Poker
 */
class Player {
  /**
   * Constructeur de Player
   * @param {string} id - Identifiant unique du joueur
   * @param {string} pseudo - Pseudo du joueur
   * @param {string} socketId - ID de la connexion Socket.io
   * @param {boolean} isOrganizer - Le joueur est-il l'organisateur de la session
   */
  constructor(id, pseudo, socketId, isOrganizer = false) {
    this.id = id;
    this.pseudo = pseudo;
    this.socketId = socketId;
    this.isOrganizer = isOrganizer;
    this.currentVote = null;
    this.hasVoted = false;
  }

  /**
   * Enregistre le vote du joueur
   * @param {number|string} value - Valeur de la carte votée (1, 2, 3, 5, 8, 13, 21, '?', 'coffee')
   */
  vote(value) {
    this.currentVote = value;
    this.hasVoted = true;
  }

  /**
   * Réinitialise le vote du joueur pour un nouveau tour
   */
  resetVote() {
    this.currentVote = null;
    this.hasVoted = false;
  }

  /**
   * Retourne les informations du joueur au format JSON
   * @param {boolean} hideVote - Masquer le vote (pour les autres joueurs)
   * @returns {Object} Informations du joueur
   */
  toJSON(hideVote = false) {
    return {
      id: this.id,
      pseudo: this.pseudo,
      isOrganizer: this.isOrganizer,
      hasVoted: this.hasVoted,
      vote: hideVote ? null : this.currentVote
    };
  }
}

module.exports = Player;