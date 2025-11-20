const {
  checkUnanimity,
  calculateAverage,
  getUnanimousValue,
  validateEstimation,
  allVotesCoffee
} = require('../../utils/calculator');

const Vote = require('../../models/Vote');

describe('Calculator Utils', () => {
  
  describe('checkUnanimity', () => {
    test('retourne true quand tous les votes sont identiques', () => {
      const votes = [
        new Vote('p1', 5, 1),
        new Vote('p2', 5, 1),
        new Vote('p3', 5, 1)
      ];
      
      expect(checkUnanimity(votes)).toBe(true);
    });

    test('retourne false quand les votes sont differents', () => {
      const votes = [
        new Vote('p1', 5, 1),
        new Vote('p2', 8, 1),
        new Vote('p3', 5, 1)
      ];
      
      expect(checkUnanimity(votes)).toBe(false);
    });

    test('retourne false pour un tableau vide', () => {
      expect(checkUnanimity([])).toBe(false);
    });

    test('ignore les cartes cafe et interrogation', () => {
      const votes = [
        new Vote('p1', 5, 1),
        new Vote('p2', 5, 1),
        new Vote('p3', 'coffee', 1)
      ];
      
      expect(checkUnanimity(votes)).toBe(true);
    });
  });

  describe('calculateAverage', () => {
    test('calcule la moyenne correctement', () => {
      const votes = [
        new Vote('p1', 5, 1),
        new Vote('p2', 8, 1),
        new Vote('p3', 5, 1)
      ];
      
      expect(calculateAverage(votes)).toBe(6);
    });

    test('arrondit la moyenne', () => {
      const votes = [
        new Vote('p1', 3, 1),
        new Vote('p2', 5, 1),
        new Vote('p3', 8, 1)
      ];
      
      expect(calculateAverage(votes)).toBe(5);
    });

    test('ignore les cartes non numeriques', () => {
      const votes = [
        new Vote('p1', 5, 1),
        new Vote('p2', 'coffee', 1),
        new Vote('p3', '?', 1),
        new Vote('p4', 8, 1)
      ];
      
      expect(calculateAverage(votes)).toBe(7);
    });

    test('retourne null si aucun vote numerique', () => {
      const votes = [
        new Vote('p1', 'coffee', 1),
        new Vote('p2', '?', 1)
      ];
      
      expect(calculateAverage(votes)).toBeNull();
    });
  });

  describe('getUnanimousValue', () => {
    test('retourne la valeur unanime', () => {
      const votes = [
        new Vote('p1', 5, 1),
        new Vote('p2', 5, 1)
      ];
      
      expect(getUnanimousValue(votes)).toBe(5);
    });

    test('retourne null si pas unanimite', () => {
      const votes = [
        new Vote('p1', 5, 1),
        new Vote('p2', 8, 1)
      ];
      
      expect(getUnanimousValue(votes)).toBeNull();
    });
  });

  describe('validateEstimation - Mode Strict', () => {
    test('valide avec unanimite', () => {
      const votes = [
        new Vote('p1', 5, 1),
        new Vote('p2', 5, 1)
      ];
      
      const result = validateEstimation(votes, 'strict', 1);
      
      expect(result.validated).toBe(true);
      expect(result.estimate).toBe(5);
      expect(result.method).toBe('unanimous');
    });

    test('rejette sans unanimite', () => {
      const votes = [
        new Vote('p1', 5, 1),
        new Vote('p2', 8, 1)
      ];
      
      const result = validateEstimation(votes, 'strict', 1);
      
      expect(result.validated).toBe(false);
      expect(result.estimate).toBeNull();
    });
  });

  describe('validateEstimation - Mode Average', () => {
    test('tour 1 necessite unanimite', () => {
      const votes = [
        new Vote('p1', 5, 1),
        new Vote('p2', 8, 1)
      ];
      
      const result = validateEstimation(votes, 'average', 1);
      
      expect(result.validated).toBe(false);
      expect(result.method).toBe('first_round_unanimity');
    });

    test('tour 2 calcule la moyenne', () => {
      const votes = [
        new Vote('p1', 5, 2),
        new Vote('p2', 8, 2),
        new Vote('p3', 5, 2)
      ];
      
      const result = validateEstimation(votes, 'average', 2);
      
      expect(result.validated).toBe(true);
      expect(result.estimate).toBe(6);
      expect(result.method).toBe('average');
    });
  });

  describe('allVotesCoffee', () => {
    test('retourne true si tous votent cafe', () => {
      const votes = [
        new Vote('p1', 'coffee', 1),
        new Vote('p2', 'coffee', 1)
      ];
      
      expect(allVotesCoffee(votes, 2)).toBe(true);
    });

    test('retourne false si pas tous cafe', () => {
      const votes = [
        new Vote('p1', 'coffee', 1),
        new Vote('p2', 5, 1)
      ];
      
      expect(allVotesCoffee(votes, 2)).toBe(false);
    });

    test('retourne false si pas assez de votes', () => {
      const votes = [
        new Vote('p1', 'coffee', 1)
      ];
      
      expect(allVotesCoffee(votes, 2)).toBe(false);
    });
  });
});