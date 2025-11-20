const express = require('express');
const router = express.Router();
const sessionManager = require('../managers/SessionManager');

/**
 * GET /api/sessions
 * Recupere toutes les sessions actives
 */
router.get('/', (req, res) => {
  try {
    const sessions = sessionManager.getAllSessions();
    const sessionsData = sessions.map(session => ({
      id: session.id,
      code: session.code,
      mode: session.mode,
      status: session.status,
      playersCount: session.players.length,
      createdAt: session.createdAt
    }));
    
    res.json({
      success: true,
      sessions: sessionsData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sessions/:code
 * Recupere une session par son code
 */
router.get('/:code', (req, res) => {
  try {
    const { code } = req.params;
    const session = sessionManager.getSessionByCode(code.toUpperCase());
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session: session.toJSON(false)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/sessions/:id
 * Supprime une session
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = sessionManager.deleteSession(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;