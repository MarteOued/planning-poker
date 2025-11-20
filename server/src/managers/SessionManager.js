const Session = require('../models/Session');
const Player = require('../models/Player');
const { v4: uuidv4 } = require('uuid');
const { isValidGameMode, validatePseudo, isValidSessionCode } = require('../utils/validators');

/**
 * Gestionnaire de sessions
 * Pattern Singleton pour avoir une seule instance
 */
class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Crée une nouvelle session
   * @param {string} organizerPseudo - Pseudo de l'organisateur
   * @param {string} mode - Mode de jeu ('strict' ou 'average')
   * @returns {Object} { success: boolean, session: Session|null, error: string|null }
   */
  createSession(organizerPseudo, mode = 'strict') {
    const pseudoValidation = validatePseudo(organizerPseudo);
    if (!pseudoValidation.valid) {
      return { success: false, session: null, error: pseudoValidation.error };
    }

    if (!isValidGameMode(mode)) {
      return { success: false, session: null, error: 'Invalid game mode' };
    }

    const organizerId = uuidv4();
    const session = new Session(organizerId, mode);
    
    const organizer = new Player(organizerId, organizerPseudo, null, true);
    session.addPlayer(organizer);

    this.sessions.set(session.id, session);

    console.log(`Session created: ${session.code} (${session.id})`);

    return { 
      success: true, 
      session: session,
      error: null 
    };
  }

  /**
   * Permet à un joueur de rejoindre une session existante
   * @param {string} sessionCode - Code de la session
   * @param {string} pseudo - Pseudo du joueur
   * @param {string} socketId - Socket ID du joueur
   * @returns {Object} { success: boolean, session: Session|null, player: Player|null, error: string|null }
   */
  joinSession(sessionCode, pseudo, socketId) {
    if (!isValidSessionCode(sessionCode)) {
      return { success: false, session: null, player: null, error: 'Invalid session code format' };
    }

    const pseudoValidation = validatePseudo(pseudo);
    if (!pseudoValidation.valid) {
      return { success: false, session: null, player: null, error: pseudoValidation.error };
    }

    const session = this.getSessionByCode(sessionCode);
    if (!session) {
      return { success: false, session: null, player: null, error: 'Session not found' };
    }

    if (session.status !== 'waiting' && session.status !== 'playing') {
      return { success: false, session: null, player: null, error: 'Session is closed' };
    }

    const existingPlayer = session.players.find(p => p.pseudo === pseudo);
    if (existingPlayer) {
      return { success: false, session: null, player: null, error: 'Pseudo already taken' };
    }

    const playerId = uuidv4();
    const player = new Player(playerId, pseudo, socketId, false);
    session.addPlayer(player);

    console.log(`Player ${pseudo} joined session ${session.code}`);

    return {
      success: true,
      session: session,
      player: player,
      error: null
    };
  }

  /**
   * Récupère une session par son ID
   * @param {string} sessionId - ID de la session
   * @returns {Session|null}
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Récupère une session par son code
   * @param {string} code - Code de la session
   * @returns {Session|null}
   */
  getSessionByCode(code) {
    for (let session of this.sessions.values()) {
      if (session.code === code) {
        return session;
      }
    }
    return null;
  }

  /**
   * Retire un joueur d'une session
   * @param {string} sessionId - ID de la session
   * @param {string} playerId - ID du joueur
   * @returns {boolean}
   */
  removePlayerFromSession(sessionId, playerId) {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    const player = session.getPlayer(playerId);
    if (!player) {
      return false;
    }

    session.removePlayer(playerId);

    console.log(`Player ${player.pseudo} left session ${session.code}`);

    if (session.players.length === 0) {
      this.deleteSession(sessionId);
    }

    return true;
  }

  /**
   * Supprime une session
   * @param {string} sessionId - ID de la session
   * @returns {boolean}
   */
  deleteSession(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    this.sessions.delete(sessionId);
    console.log(`Session ${session.code} deleted`);
    return true;
  }

  /**
   * Récupère toutes les sessions actives
   * @returns {Array}
   */
  getAllSessions() {
    return Array.from(this.sessions.values());
  }
}

const sessionManager = new SessionManager();

module.exports = sessionManager;