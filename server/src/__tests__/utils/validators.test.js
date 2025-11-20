const {
  isValidCardValue,
  isValidGameMode,
  validateFeature,
  validateBacklog,
  validatePseudo,
  isValidSessionCode,
  VALID_CARD_VALUES,
  VALID_GAME_MODES
} = require('../../utils/validators');

describe('Validators Utils', () => {
  
  describe('isValidCardValue', () => {
    test('accepte les valeurs valides', () => {
      expect(isValidCardValue(1)).toBe(true);
      expect(isValidCardValue(5)).toBe(true);
      expect(isValidCardValue(13)).toBe(true);
      expect(isValidCardValue('?')).toBe(true);
      expect(isValidCardValue('coffee')).toBe(true);
    });

    test('rejette les valeurs invalides', () => {
      expect(isValidCardValue(99)).toBe(false);
      expect(isValidCardValue('banana')).toBe(false);
      expect(isValidCardValue(null)).toBe(false);
    });
  });

  describe('isValidGameMode', () => {
    test('accepte les modes valides', () => {
      expect(isValidGameMode('strict')).toBe(true);
      expect(isValidGameMode('average')).toBe(true);
    });

    test('rejette les modes invalides', () => {
      expect(isValidGameMode('median')).toBe(false);
      expect(isValidGameMode('random')).toBe(false);
      expect(isValidGameMode('')).toBe(false);
    });
  });

  describe('validateFeature', () => {
    test('valide une feature correcte', () => {
      const feature = {
        id: 'feat-1',
        name: 'Ma feature',
        description: 'Description'
      };
      
      const result = validateFeature(feature);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejette une feature sans id', () => {
      const feature = {
        name: 'Ma feature'
      };
      
      const result = validateFeature(feature);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Feature must have a valid id');
    });

    test('rejette une feature sans nom', () => {
      const feature = {
        id: 'feat-1',
        name: ''
      };
      
      const result = validateFeature(feature);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Feature must have a valid name');
    });
  });

  describe('validateBacklog', () => {
    test('valide un backlog correct', () => {
      const backlog = {
        features: [
          { id: 'feat-1', name: 'Feature 1' },
          { id: 'feat-2', name: 'Feature 2' }
        ]
      };
      
      const result = validateBacklog(backlog);
      expect(result.valid).toBe(true);
    });

    test('rejette un backlog sans features', () => {
      const backlog = {};
      
      const result = validateBacklog(backlog);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('features');
    });

    test('rejette un backlog vide', () => {
      const backlog = {
        features: []
      };
      
      const result = validateBacklog(backlog);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least one feature');
    });

    test('rejette si features invalides', () => {
      const backlog = {
        features: [
          { id: 'feat-1', name: '' }
        ]
      };
      
      const result = validateBacklog(backlog);
      expect(result.valid).toBe(false);
    });
  });

  describe('validatePseudo', () => {
    test('accepte un pseudo valide', () => {
      const result = validatePseudo('Alice');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('rejette un pseudo vide', () => {
      const result = validatePseudo('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    test('rejette un pseudo trop long', () => {
      const result = validatePseudo('A'.repeat(25));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('20 characters');
    });

    test('rejette un pseudo avec que des espaces', () => {
      const result = validatePseudo('   ');
      expect(result.valid).toBe(false);
    });
  });

  describe('isValidSessionCode', () => {
    test('accepte un code valide', () => {
      expect(isValidSessionCode('ABC123')).toBe(true);
      expect(isValidSessionCode('XYZ999')).toBe(true);
    });

    test('rejette un code trop court', () => {
      expect(isValidSessionCode('ABC12')).toBe(false);
    });

    test('rejette un code trop long', () => {
      expect(isValidSessionCode('ABC1234')).toBe(false);
    });

    test('rejette un code avec minuscules', () => {
      expect(isValidSessionCode('abc123')).toBe(false);
    });

    test('rejette un code avec caracteres speciaux', () => {
      expect(isValidSessionCode('ABC-12')).toBe(false);
    });
  });
});