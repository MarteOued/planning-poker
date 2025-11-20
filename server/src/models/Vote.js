/**
 * Classe représentant un vote pour une fonctionnalité
 */
class Vote {
  /**
   * Constructeur de Vote
   * @param {string} playerId - ID du joueur qui vote
   * @param {number|string} value - Valeur votée
   * @param {number} round - Numéro du tour de vote
   */
  constructor(playerId, value, round) {
    this.playerId = playerId;
    this.value = value;
    this.round = round;
    this.timestamp = new Date();
  }

  /**
   * Vérifie si le vote est une carte café
   * @returns {boolean}
   */
  isCoffeeCard() {
    return this.value === 'coffee';
  }

  /**
   * Vérifie si le vote est une carte "?" (je ne sais pas)
   * @returns {boolean}
   */
  isUnknownCard() {
    return this.value === '?';
  }

  /**
   * Vérifie si le vote est une valeur numérique
   * @returns {boolean}
   */
  isNumericValue() {
    return typeof this.value === 'number' || !isNaN(parseInt(this.value));
  }

  /**
   * Retourne la valeur numérique du vote
   * @returns {number|null}
   */
  getNumericValue() {
    if (this.isNumericValue()) {
      return typeof this.value === 'number' ? this.value : parseInt(this.value);
    }
    return null;
  }

  /**
   * Retourne le vote au format JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      playerId: this.playerId,
      value: this.value,
      round: this.round,
      timestamp: this.timestamp
    };
  }
}

module.exports = Vote;