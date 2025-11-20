const sessionManager = require('../managers/SessionManager');
const votingManager = require('../managers/VotingManager');

/**
 * Gestionnaire des événements liés aux votes
 * @param {Socket} io - Instance Socket.io
 * @param {Socket} socket - Socket du client
 */
function handleVoteEvents(io, socket) {
  
  /**
   * Événement : Soumettre un vote
   * Reçoit : { sessionId: string, playerId: string, cardValue: number|string }
   * Émet : vote-recorded, all-voted ou error
   */
  socket.on('submit-vote', (data) => {
    const { sessionId, playerId, cardValue } = data;
    
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    const result = votingManager.submitVote(session, playerId, cardValue);
    
    if (result.success) {
      const player = session.getPlayer(playerId);
      
      socket.emit('vote-recorded', {
        success: true
      });
      
      io.to(sessionId).emit('player-voted', {
        playerId: playerId,
        pseudo: player.pseudo,
        hasVoted: true
      });
      
      const allVoted = votingManager.checkAllVoted(session);
      
      if (allVoted) {
        const validation = votingManager.validateVotes(session);
        
        if (validation.allCoffee) {
          io.to(sessionId).emit('coffee-break', {
            message: 'All players voted coffee. Session will be saved.'
          });
        } else {
          const votes = session.getAllCurrentVotes();
          
          io.to(sessionId).emit('all-voted', {
            votes: votes,
            validated: validation.validated,
            estimate: validation.estimate,
            method: validation.method,
            needsRevote: validation.needsRevote
          });
        }
      }
      
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  /**
   * Événement : Démarrer un nouveau tour de vote
   * Reçoit : { sessionId: string }
   * Émet : new-round ou error
   */
  socket.on('start-new-round', (data) => {
    const { sessionId } = data;
    
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    const success = votingManager.startNewRound(session);
    
    if (success) {
      const feature = session.getCurrentFeature();
      
      io.to(sessionId).emit('new-round', {
        round: feature.currentRound,
        featureName: feature.name
      });
    } else {
      socket.emit('error', { message: 'Cannot start new round' });
    }
  });

  /**
   * Événement : Passer à la fonctionnalité suivante
   * Reçoit : { sessionId: string }
   * Émet : next-feature, backlog-completed ou error
   */
  socket.on('next-feature', (data) => {
    const { sessionId } = data;
    
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    const result = votingManager.moveToNextFeature(session);
    
    if (result.hasNext) {
      io.to(sessionId).emit('next-feature', {
        feature: result.nextFeature.toJSON(),
        index: session.currentFeatureIndex,
        total: session.backlog.length
      });
    } else {
      io.to(sessionId).emit('backlog-completed', {
        message: 'All features have been estimated',
        results: session.backlog.map(f => f.toJSON())
      });
    }
  });
}

module.exports = handleVoteEvents;