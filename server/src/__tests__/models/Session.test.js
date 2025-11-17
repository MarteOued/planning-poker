const Session = require('../../models/Session');

// Mock pour Player si la classe n'existe pas encore
class MockPlayer {
  constructor(id, pseudo) {
    this.id = id;
    this.pseudo = pseudo;
  }
}

describe('Classe Session - Tests de base', () => {
  test('devrait créer une instance de session', () => {
    const session = new Session('org-123');
    expect(session).toBeInstanceOf(Session);
    expect(session.code).toHaveLength(6);
  });

  test('devrait ajouter et supprimer des joueurs', () => {
    const session = new Session('org-123');
    const player = new MockPlayer('p1', 'Alice');
    
    session.addPlayer(player);
    expect(session.players).toHaveLength(1);
    
    session.removePlayer('p1');
    expect(session.players).toHaveLength(0);
  });

  test('devrait gérer le backlog', () => {
    const session = new Session('org-123');
    const features = [{ id: 'F1', name: 'Test Feature' }];
    
    session.loadBacklog(features);
    expect(session.backlog).toHaveLength(1);
    
    const current = session.getCurrentFeature();
    expect(current).toEqual(features[0]);
  });

  test('devrait générer un code à 6 caractères', () => {
    const session = new Session('org-123');
    expect(session.code).toMatch(/^[A-Z0-9]{6}$/);
  });

  test('devrait lancer une erreur pour un pseudo dupliqué', () => {
    const session = new Session('org-123');
    const player1 = new MockPlayer('p1', 'Alice');
    const player2 = new MockPlayer('p2', 'Alice');
    
    session.addPlayer(player1);
    
    expect(() => {
      session.addPlayer(player2);
    }).toThrow('Ce pseudo est déjà utilisé');
  });

  test('devrait passer à la fonctionnalité suivante', () => {
    const session = new Session('org-123');
    const features = [
      { id: 'F1', name: 'Feature 1' },
      { id: 'F2', name: 'Feature 2' }
    ];
    
    session.loadBacklog(features);
    const nextFeature = session.nextFeature();
    
    expect(nextFeature).toEqual(features[1]);
    expect(session.currentFeatureIndex).toBe(1);
  });

  test('devrait calculer la progression', () => {
    const session = new Session('org-123');
    const features = [
      { id: 'F1', name: 'Feature 1' },
      { id: 'F2', name: 'Feature 2' },
      { id: 'F3', name: 'Feature 3' }
    ];
    
    session.loadBacklog(features);
    session.nextFeature(); // Passe à la deuxième feature
    
    const progress = session.getProgress();
    
    expect(progress.total).toBe(3);
    expect(progress.completed).toBe(1);
    expect(progress.percentage).toBe(33);
  });
});