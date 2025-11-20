/**
 * @module utils/calculator
 * @description Utilitaires de calcul pour le Planning Poker.
 * Ce module contient les fonctions pour valider les votes selon différents modes de jeu.
 */

/**
 * Vérifie si tous les votes sont identiques (unanimité)
 * @function checkUnanimity
 * @param {Array<Vote>} votes - Tableau de votes
 * @returns {boolean} true si tous les votes numériques sont identiques
 * @example
 * const votes = [new Vote('p1', 5, 1), new Vote('p2', 5, 1)];
 * checkUnanimity(votes); // returns true
 */
function checkUnanimity(votes) {
  if (votes.length === 0) {
    return false;
  }

  const numericVotes = votes.filter(vote => {
    return vote.value !== 'coffee' && vote.value !== '?';
  });

  if (numericVotes.length === 0) {
    return false;
  }

  const firstValue = numericVotes[0].value;
  return numericVotes.every(vote => vote.value === firstValue);
}

/**
 * Calcule la moyenne des votes numériques
 * @function calculateAverage
 * @param {Array<Vote>} votes - Tableau de votes
 * @returns {number|null} Moyenne arrondie ou null si aucun vote valide
 * @example
 * const votes = [new Vote('p1', 5, 1), new Vote('p2', 8, 1)];
 * calculateAverage(votes); // returns 7 (arrondi de 6.5)
 */
function calculateAverage(votes) {
  const numericVotes = votes.filter(vote => {
    const value = vote.value;
    return value !== 'coffee' && value !== '?' && !isNaN(Number(value));
  });

  if (numericVotes.length === 0) {
    return null;
  }

  const sum = numericVotes.reduce((acc, vote) => {
    return acc + Number(vote.value);
  }, 0);

  const average = sum / numericVotes.length;
  
  return Math.round(average);
}

/**
 * Trouve la valeur commune en cas d'unanimité
 * @function getUnanimousValue
 * @param {Array<Vote>} votes - Tableau de votes
 * @returns {number|string|null} La valeur unanime ou null
 */
function getUnanimousValue(votes) {
  if (!checkUnanimity(votes)) {
    return null;
  }

  const numericVotes = votes.filter(vote => {
    return vote.value !== 'coffee' && vote.value !== '?';
  });

  return numericVotes.length > 0 ? numericVotes[0].value : null;
}

/**
 * Valide une estimation selon le mode de jeu
 * @function validateEstimation
 * @param {Array<Vote>} votes - Tableau de votes du tour actuel
 * @param {string} mode - Mode de jeu ('strict' ou 'average')
 * @param {number} round - Numéro du tour (1, 2, 3...)
 * @returns {Object} Résultat de la validation
 * @returns {boolean} returns.validated - Si l'estimation est validée
 * @returns {number|null} returns.estimate - La valeur estimée
 * @returns {string} returns.method - Méthode de validation utilisée
 * @example
 * // Mode strict avec unanimité
 * const votes = [new Vote('p1', 5, 1), new Vote('p2', 5, 1)];
 * validateEstimation(votes, 'strict', 1);
 * // returns { validated: true, estimate: 5, method: 'unanimous' }
 * 
 * @example
 * // Mode moyenne au tour 2
 * const votes = [new Vote('p1', 5, 2), new Vote('p2', 8, 2)];
 * validateEstimation(votes, 'average', 2);
 * // returns { validated: true, estimate: 7, method: 'average' }
 */
function validateEstimation(votes, mode, round) {
  if (votes.length === 0) {
    return { validated: false, estimate: null, method: 'none' };
  }

  if (mode === 'strict') {
    if (checkUnanimity(votes)) {
      return {
        validated: true,
        estimate: getUnanimousValue(votes),
        method: 'unanimous'
      };
    }
    return { validated: false, estimate: null, method: 'strict' };
  }

  if (mode === 'average') {
    if (round === 1) {
      if (checkUnanimity(votes)) {
        return {
          validated: true,
          estimate: getUnanimousValue(votes),
          method: 'unanimous'
        };
      }
      return { validated: false, estimate: null, method: 'first_round_unanimity' };
    } else {
      const average = calculateAverage(votes);
      if (average !== null) {
        return {
          validated: true,
          estimate: average,
          method: 'average'
        };
      }
      return { validated: false, estimate: null, method: 'no_numeric_votes' };
    }
  }

  return { validated: false, estimate: null, method: 'unknown_mode' };
}

/**
 * Vérifie si tous les votes sont des cartes café
 * @function allVotesCoffee
 * @param {Array<Vote>} votes - Tableau de votes
 * @param {number} totalPlayers - Nombre total de joueurs
 * @returns {boolean} true si tous les joueurs ont voté café
 */
function allVotesCoffee(votes, totalPlayers) {
  if (votes.length !== totalPlayers) {
    return false;
  }
  return votes.every(vote => vote.value === 'coffee');
}

module.exports = {
  checkUnanimity,
  calculateAverage,
  getUnanimousValue,
  validateEstimation,
  allVotesCoffee
};