const Vote = require('../models/Vote');
const { validateEstimation, allVotesCoffee } = require('../utils/calculator');
const { isValidCardValue } = require('../utils/validators');

/**
 * Gestionnaire de votes
 */
class VotingManager {
  /**
   * Enregistre le vote d'un joueur
   * @param {Session} session - Session concernée
   * @param {string} playerId - ID du joueur
   * @param {number|string} cardValue - Valeur de la carte
   * @returns {Object} { success: boolean, error: string|null }
   */
  submitVote(session, playerId, cardValue) {
    if (!isValidCardValue(cardValue)) {
      return { success: false, error: 'Invalid card value' };
    }

    const player = session.getPlayer(playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    if (player.hasVoted) {
      return { success: false, error: 'Player has already voted' };
    }

    const feature = session.getCurrentFeature();
    if (!feature) {
      return { success: false, error: 'No feature to vote on' };
    }

    player.vote(cardValue);
    
    const vote = new Vote(playerId, cardValue, feature.currentRound);
    feature.addVote(vote);

    console.log(`Player ${player.pseudo} voted: ${cardValue}`);

    return { success: true, error: null };
  }

  /**
   * Vérifie si tous les joueurs ont voté
   * @param {Session} session - Session concernée
   * @returns {boolean}
   */
  checkAllVoted(session) {
    return session.allPlayersVoted();
  }

  /**
   * Valide les votes et détermine si la fonctionnalité est estimée
   * @param {Session} session - Session concernée
   * @returns {Object} { validated: boolean, estimate: number|null, method: string, needsRevote: boolean, allCoffee: boolean }
   */
  validateVotes(session) {
    const feature = session.getCurrentFeature();
    if (!feature) {
      return { 
        validated: false, 
        estimate: null, 
        method: 'no_feature',
        needsRevote: false,
        allCoffee: false
      };
    }

    const currentVotes = feature.getCurrentRoundVotes();
    
    const coffeeCheck = allVotesCoffee(currentVotes, session.players.length);
    if (coffeeCheck) {
      return {
        validated: false,
        estimate: null,
        method: 'coffee_break',
        needsRevote: false,
        allCoffee: true
      };
    }

    const result = validateEstimation(
      currentVotes,
      session.mode,
      feature.currentRound
    );

    if (result.validated) {
      feature.setEstimate(result.estimate);
      console.log(`Feature "${feature.name}" estimated at ${result.estimate} (${result.method})`);
    } else {
      console.log(`Feature "${feature.name}" not validated, starting new round`);
    }

    return {
      validated: result.validated,
      estimate: result.estimate,
      method: result.method,
      needsRevote: !result.validated,
      allCoffee: false
    };
  }

  /**
   * Prépare un nouveau tour de vote
   * @param {Session} session - Session concernée
   * @returns {boolean}
   */
  startNewRound(session) {
    const feature = session.getCurrentFeature();
    if (!feature) {
      return false;
    }

    feature.startNewRound();
    session.resetAllVotes();

    console.log(`Starting round ${feature.currentRound} for feature "${feature.name}"`);
    
    return true;
  }

  /**
   * Passe à la fonctionnalité suivante
   * @param {Session} session - Session concernée
   * @returns {Object} { hasNext: boolean, nextFeature: Feature|null }
   */
  moveToNextFeature(session) {
    const hasNext = session.nextFeature();
    const nextFeature = session.getCurrentFeature();

    if (hasNext) {
      console.log(`Moving to next feature: "${nextFeature.name}"`);
    } else {
      console.log(`Backlog completed for session ${session.code}`);
    }

    return {
      hasNext: hasNext,
      nextFeature: nextFeature
    };
  }

  /**
   * Récupère les résultats de vote actuels
   * @param {Session} session - Session concernée
   * @param {boolean} hideVotes - Masquer les votes individuels
   * @returns {Object}
   */
  getVotingResults(session, hideVotes = false) {
    const feature = session.getCurrentFeature();
    if (!feature) {
      return null;
    }

    const votes = feature.getCurrentRoundVotes();
    
    return {
      featureName: feature.name,
      round: feature.currentRound,
      totalVotes: votes.length,
      votes: hideVotes ? null : votes.map(v => ({
        playerId: v.playerId,
        pseudo: session.getPlayer(v.playerId).pseudo,
        value: v.value
      }))
    };
  }
}

const votingManager = new VotingManager();

module.exports = votingManager;