const Session = require('../models/Session');

// Mock pour Player si la classe n'existe pas encore
class MockPlayer {
  constructor(id, pseudo) {
    this.id = id;
    this.pseudo = pseudo;
  }
}

describe('Session Class - Basic Tests', () => {
  test('should create session instance', () => {
    const session = new Session('org-123');
    expect(session).toBeInstanceOf(Session);
    expect(session.code).toHaveLength(6);
  });

  test('should add and remove players', () => {
    const session = new Session('org-123');
    const player = new MockPlayer('p1', 'Alice');
    
    session.addPlayer(player);
    expect(session.players).toHaveLength(1);
    
    session.removePlayer('p1');
    expect(session.players).toHaveLength(0);
  });

  test('should manage backlog', () => {
    const session = new Session('org-123');
    const features = [{ id: 'F1', name: 'Test Feature' }];
    
    session.loadBacklog(features);
    expect(session.backlog).toHaveLength(1);
    
    const current = session.getCurrentFeature();
    expect(current).toEqual(features[0]);
  });
});