/**
 * Utilitaires de validation des données
 */

/**
 * Valeurs de cartes autorisées
 */
const VALID_CARD_VALUES = [1, 2, 3, 5, 8, 13, 20, 40, 100, '?', 'coffee'];

/**
 * Modes de jeu autorisés
 */
const VALID_GAME_MODES = ['strict', 'average'];

/**
 * Vérifie si une valeur de carte est valide
 * @param {number|string} value - Valeur à vérifier
 * @returns {boolean}
 */
function isValidCardValue(value) {
  return VALID_CARD_VALUES.includes(value) || VALID_CARD_VALUES.includes(Number(value));
}

/**
 * Vérifie si un mode de jeu est valide
 * @param {string} mode - Mode à vérifier
 * @returns {boolean}
 */
function isValidGameMode(mode) {
  return VALID_GAME_MODES.includes(mode);
}

/**
 * Valide les données d'une fonctionnalité
 * @param {Object} feature - Objet fonctionnalité
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateFeature(feature) {
  const errors = [];

  if (!feature.id || typeof feature.id !== 'string') {
    errors.push('Feature must have a valid id');
  }

  if (!feature.name || typeof feature.name !== 'string' || feature.name.trim() === '') {
    errors.push('Feature must have a valid name');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valide un backlog complet
 * @param {Object} backlog - Objet backlog avec array de features
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateBacklog(backlog) {
  const errors = [];

  if (!backlog || typeof backlog !== 'object') {
    errors.push('Backlog must be an object');
    return { valid: false, errors };
  }

  if (!Array.isArray(backlog.features)) {
    errors.push('Backlog must contain a features array');
    return { valid: false, errors };
  }

  if (backlog.features.length === 0) {
    errors.push('Backlog must contain at least one feature');
    return { valid: false, errors };
  }

  backlog.features.forEach((feature, index) => {
    const validation = validateFeature(feature);
    if (!validation.valid) {
      errors.push(`Feature at index ${index}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valide un pseudo de joueur
 * @param {string} pseudo - Pseudo à vérifier
 * @returns {Object} { valid: boolean, error: string|null }
 */
function validatePseudo(pseudo) {
  if (!pseudo || typeof pseudo !== 'string') {
    return { valid: false, error: 'Pseudo must be a non-empty string' };
  }

  const trimmed = pseudo.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Pseudo cannot be empty' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Pseudo must be 20 characters or less' };
  }

  return { valid: true, error: null };
}

/**
 * Valide un code de session
 * @param {string} code - Code à vérifier
 * @returns {boolean}
 */
function isValidSessionCode(code) {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  return /^[A-Z0-9]{6}$/.test(code);
}

module.exports = {
  VALID_CARD_VALUES,
  VALID_GAME_MODES,
  isValidCardValue,
  isValidGameMode,
  validateFeature,
  validateBacklog,
  validatePseudo,
  isValidSessionCode
};
