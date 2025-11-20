const sessionManager = require('../managers/SessionManager');
const backlogManager = require('../managers/BacklogManager');
const fileManager = require('../managers/FileManager');

function handleGameEvents(io, socket) {
  
  socket.on('load-backlog', (data) => {
    const { sessionId, backlog } = data;
    
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    const result = backlogManager.parseBacklog(backlog);
    
    if (!result.success) {
      socket.emit('error', { 
        message: 'Invalid backlog format',
        errors: result.error
      });
      return;
    }
    
    session.setBacklog(result.features);
    session.status = 'playing';
    
    const firstFeature = session.getCurrentFeature();
    
    io.to(sessionId).emit('backlog-loaded', {
      totalFeatures: result.features.length,
      features: backlogManager.getAllFeatures(session)
    });
    
    io.to(sessionId).emit('game-started', {
      feature: firstFeature.toJSON(),
      index: 0,
      total: result.features.length
    });
    
    console.log(`Backlog loaded for session ${session.code}: ${result.features.length} features`);
  });

  socket.on('save-session', async (data) => {
    const { sessionId } = data;
    
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    const saveData = {
      sessionId: session.id,
      code: session.code,
      createdAt: session.createdAt,
      pausedAt: new Date(),
      mode: session.mode,
      players: session.players.map(p => ({
        id: p.id,
        pseudo: p.pseudo,
        isOrganizer: p.isOrganizer
      })),
      backlog: {
        name: 'Planning Poker Backlog',
        totalFeatures: session.backlog.length,
        currentIndex: session.currentFeatureIndex
      },
      completedFeatures: backlogManager.getCompletedFeatures(session),
      remainingFeatures: backlogManager.getRemainingFeatures(session),
      progress: backlogManager.getProgress(session)
    };
    
    const saveResult = await fileManager.saveSession(session.code, saveData);
    
    if (saveResult.success) {
      io.to(sessionId).emit('session-saved', {
        saveData: saveData,
        fileName: saveResult.fileName,
        message: 'Session saved successfully. You can resume later.'
      });
      
      console.log(`Session ${session.code} saved to ${saveResult.fileName}`);
    } else {
      socket.emit('error', { message: 'Failed to save session' });
    }
  });

  socket.on('list-saved-sessions', async () => {
    const sessions = await fileManager.listSavedSessions();
    
    socket.emit('saved-sessions-list', {
      sessions: sessions
    });
  });

  socket.on('resume-session', async (data) => {
    const { fileName } = data;
    
    const loadResult = await fileManager.loadSession(fileName);
    
    if (!loadResult.success) {
      socket.emit('error', { message: 'Failed to load session' });
      return;
    }
    
    const saveData = loadResult.data;
    
    const result = sessionManager.createSession(
      saveData.players.find(p => p.isOrganizer).pseudo,
      saveData.mode
    );
    
    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    const session = result.session;
    
    const allFeatures = [
      ...saveData.completedFeatures,
      ...saveData.remainingFeatures
    ].map(f => {
      const feature = backlogManager.addFeature(session, f.name, f.description || '').feature;
      if (f.estimate) {
        feature.setEstimate(f.estimate);
      }
      return feature;
    });
    
    session.backlog = allFeatures;
    session.currentFeatureIndex = saveData.backlog.currentIndex;
    session.status = 'playing';
    
    socket.emit('session-resumed', {
      sessionId: session.id,
      sessionCode: session.code,
      session: session.toJSON(false),
      message: 'Session resumed successfully'
    });
    
    console.log(`Session ${session.code} resumed from ${fileName}`);
  });

  socket.on('export-results', async (data) => {
    const { sessionId } = data;
    
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    const completedFeatures = backlogManager.getCompletedFeatures(session);
    
    const exportData = {
      sessionId: session.id,
      sessionCode: session.code,
      mode: session.mode,
      startedAt: session.createdAt,
      completedAt: new Date(),
      duration: new Date() - session.createdAt,
      players: session.players.map(p => p.pseudo),
      statistics: {
        totalFeatures: completedFeatures.length,
        totalRounds: completedFeatures.reduce((sum, f) => sum + (f.currentRound || 1), 0),
        averageRoundsPerFeature: completedFeatures.length > 0 
          ? (completedFeatures.reduce((sum, f) => sum + (f.currentRound || 1), 0) / completedFeatures.length).toFixed(2)
          : 0
      },
      results: completedFeatures,
      totalEstimate: completedFeatures.reduce((sum, f) => sum + (f.estimate || 0), 0)
    };
    
    const exportResult = await fileManager.exportResults(session.code, exportData);
    
    if (exportResult.success) {
      const downloadable = fileManager.createDownloadableJSON(
        exportData,
        `planning-poker-results-${session.code}`
      );
      
      socket.emit('results-exported', {
        exportData: exportData,
        downloadable: downloadable,
        fileName: exportResult.fileName,
        message: 'Results exported successfully'
      });
      
      console.log(`Results exported for session ${session.code}`);
    } else {
      socket.emit('error', { message: 'Failed to export results' });
    }
  });

  socket.on('add-feature', (data) => {
    const { sessionId, name, description } = data;
    
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    const result = backlogManager.addFeature(session, name, description);
    
    if (result.success) {
      io.to(sessionId).emit('feature-added', {
        feature: result.feature.toJSON(),
        totalFeatures: session.backlog.length
      });
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  socket.on('get-progress', (data) => {
    const { sessionId } = data;
    
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    const progress = backlogManager.getProgress(session);
    
    socket.emit('progress-update', progress);
  });
}

module.exports = handleGameEvents;