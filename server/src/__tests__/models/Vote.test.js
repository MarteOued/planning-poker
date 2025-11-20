const Vote = require('../../models/Vote');

describe('Vote Model', () => {
  
  test('cree un vote correctement', () => {
    const vote = new Vote('p1', 5, 1);
    
    expect(vote.playerId).toBe('p1');
    expect(vote.value).toBe(5);
    expect(vote.round).toBe(1);
    expect(vote.timestamp).toBeInstanceOf(Date);
  });

  test('detecte une carte cafe', () => {
    const vote = new Vote('p1', 'coffee', 1);
    
    expect(vote.isCoffeeCard()).toBe(true);
  });

  test('detecte une carte interrogation', () => {
    const vote = new Vote('p1', '?', 1);
    
    expect(vote.isUnknownCard()).toBe(true);
  });

  test('detecte une valeur numerique', () => {
    const vote = new Vote('p1', 5, 1);
    
    expect(vote.isNumericValue()).toBe(true);
  });

  test('getNumericValue retourne le nombre', () => {
    const vote = new Vote('p1', 5, 1);
    
    expect(vote.getNumericValue()).toBe(5);
  });

  test('getNumericValue retourne null pour cafe', () => {
    const vote = new Vote('p1', 'coffee', 1);
    
    expect(vote.getNumericValue()).toBeNull();
  });

  test('toJSON retourne le bon format', () => {
    const vote = new Vote('p1', 5, 1);
    const json = vote.toJSON();
    
    expect(json.playerId).toBe('p1');
    expect(json.value).toBe(5);
    expect(json.round).toBe(1);
    expect(json.timestamp).toBeDefined();
  });
});