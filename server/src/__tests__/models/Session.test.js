const Session = require('../../models/Session');

describe('Session Model', () => {
  
  test('crée une session correctement', () => {
    const session = new Session('org-1', 'strict');
    
    expect(session.id).toBeDefined();
    expect(session.code).toBeDefined();
    expect(session.mode).toBe('strict');
    expect(session.organizerId).toBe('org-1');
    expect(session.players).toEqual([]);
    expect(session.status).toBe('waiting');
  });

  test('génère un code de 6 caractères', () => {
    const session = new Session('org-1');
    
    expect(session.code).toHaveLength(6);
    expect(session.code).toMatch(/^[A-Z0-9]{6}$/);
  });

  test('getCurrentFeature retourne null si pas de backlog', () => {
    const session = new Session('org-1');
    
    expect(session.getCurrentFeature()).toBeNull();
  });

  test('isCompleted retourne true si pas de backlog', () => {
    const session = new Session('org-1');
    
    expect(session.isCompleted()).toBe(true);
  });

  test('loadBacklog charge les fonctionnalités', () => {
    const session = new Session('org-1');
    const features = [
      { id: 'US-001', name: 'Feature 1' },
      { id: 'US-002', name: 'Feature 2' }
    ];
    
    session.loadBacklog(features);
    
    expect(session.backlog).toHaveLength(2);
    expect(session.currentFeatureIndex).toBe(0);
  });

  test('getProgress calcule la progression correctement', () => {
    const session = new Session('org-1');
    session.loadBacklog([
      { id: 'US-001', name: 'Feature 1' },
      { id: 'US-002', name: 'Feature 2' }
    ]);
    
    const progress = session.getProgress();
    
    expect(progress.total).toBe(2);
    expect(progress.completed).toBe(0);
    expect(progress.percentage).toBe(0);
  });

  test('toJSON retourne un objet valide', () => {
    const session = new Session('org-1', 'strict');
    const json = session.toJSON(false);
    
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('code');
    expect(json).toHaveProperty('mode', 'strict');
    expect(json).toHaveProperty('status', 'waiting');
  });
});