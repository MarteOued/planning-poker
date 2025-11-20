const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileManager = require('../managers/FileManager');
const backlogManager = require('../managers/BacklogManager');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

/**
 * POST /api/files/upload-backlog
 * Upload et valide un fichier backlog JSON
 */
router.post('/upload-backlog', upload.single('backlog'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const parseResult = fileManager.parseBacklogFile(req.file.buffer);
    
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error
      });
    }

    const validationResult = backlogManager.parseBacklog(parseResult.data);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }

    res.json({
      success: true,
      data: parseResult.data,
      features: validationResult.features.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/files/saved-sessions
 * Liste toutes les sessions sauvegardees
 */
router.get('/saved-sessions', async (req, res) => {
  try {
    const sessions = await fileManager.listSavedSessions();
    
    res.json({
      success: true,
      sessions: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/files/saved-sessions/:fileName
 * Charge une session sauvegardee
 */
router.get('/saved-sessions/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const result = await fileManager.loadSession(fileName);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/files/saved-sessions/:fileName
 * Supprime une session sauvegardee
 */
router.delete('/saved-sessions/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const deleted = await fileManager.deleteSession(fileName);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Session file deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/files/download-results
 * Genere un fichier JSON de resultats telechargeable
 */
router.post('/download-results', (req, res) => {
  try {
    const { results, sessionCode } = req.body;
    
    if (!results || !sessionCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing results or sessionCode'
      });
    }

    const downloadable = fileManager.createDownloadableJSON(
      results,
      `planning-poker-results-${sessionCode}`
    );

    res.setHeader('Content-Type', downloadable.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadable.filename}"`);
    res.send(downloadable.content);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/files/clean-old-sessions
 * Nettoie les anciennes sessions sauvegardees
 */
router.post('/clean-old-sessions', async (req, res) => {
  try {
    const deletedCount = await fileManager.cleanOldSessions();
    
    res.json({
      success: true,
      message: `${deletedCount} old session files deleted`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;