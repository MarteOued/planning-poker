/**
 * Classe représentant une fonctionnalité à estimer
 */
class Feature {
  /**
   * Constructeur de Feature
   * @param {string} id - Identifiant unique de la fonctionnalité
   * @param {string} name - Nom de la fonctionnalité
   * @param {string} description - Description de la fonctionnalité
   */
  constructor(id, name, description = '') {
    this.id = id;
    this.name = name;
    this.description = description;
    this.votes = [];
    this.estimate = null;
    this.completed = false;
    this.currentRound = 1;
    this.votingHistory = [];
  }

  /**
   * Ajoute un vote pour cette fonctionnalité
   * @param {Vote} vote - Vote à ajouter
   */
  addVote(vote) {
    this.votes.push(vote);
  }

  /**
   * Récupère tous les votes du tour actuel
   * @returns {Array} Tableau des votes du tour actuel
   */
  getCurrentRoundVotes() {
    return this.votes.filter(vote => vote.round === this.currentRound);
  }

  /**
   * Vérifie si tous les joueurs ont voté pour le tour actuel
   * @param {number} totalPlayers - Nombre total de joueurs
   * @returns {boolean}
   */
  allPlayersVoted(totalPlayers) {
    return this.getCurrentRoundVotes().length === totalPlayers;
  }

  /**
   * Vérifie si tous les joueurs ont voté la carte café
   * @param {number} totalPlayers - Nombre total de joueurs
   * @returns {boolean}
   */
  allPlayersCoffee(totalPlayers) {
    const currentVotes = this.getCurrentRoundVotes();
    if (currentVotes.length !== totalPlayers) {
      return false;
    }
    return currentVotes.every(vote => vote.isCoffeeCard());
  }

  /**
   * Définit l'estimation finale de la fonctionnalité
   * @param {number} value - Valeur de l'estimation
   */
  setEstimate(value) {
    this.estimate = value;
    this.completed = true;
  }

  /**
   * Prépare un nouveau tour de vote
   */
  startNewRound() {
    this.votingHistory.push({
      round: this.currentRound,
      votes: this.getCurrentRoundVotes().map(v => v.toJSON())
    });
    
    this.currentRound++;
    this.votes = this.votes.filter(vote => vote.round !== this.currentRound - 1);
  }

  /**
   * Réinitialise tous les votes
   */
  clearVotes() {
    this.votes = [];
  }

  /**
   * Retourne la fonctionnalité au format JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      estimate: this.estimate,
      completed: this.completed,
      currentRound: this.currentRound,
      votingHistory: this.votingHistory
    };
  }
}

module.exports = Feature;