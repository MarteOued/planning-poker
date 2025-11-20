const sessionManager = require('../managers/SessionManager');

/**
 * Gestionnaire des événements liés aux sessions
 * @param {Socket} io - Instance Socket.io
 * @param {Socket} socket - Socket du client
 */
function handleSessionEvents(io, socket) {
  
  /**
   * Événement : Créer une nouvelle session
   * Reçoit : { organizerPseudo: string, mode: string }
   * Émet : session-created ou error
   */
  socket.on('create-session', (data) => {
    const { organizerPseudo, mode } = data;
    
    const result = sessionManager.createSession(organizerPseudo, mode);
    
    if (result.success) {
      const session = result.session;
      const organizer = session.players[0];
      
      organizer.socketId = socket.id;
      
      socket.join(session.id);
      
      socket.emit('session-created', {
        sessionId: session.id,
        sessionCode: session.code,
        playerId: organizer.id,
        session: session.toJSON(false)
      });
      
      console.log(`Session ${session.code} created by ${organizerPseudo}`);
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  /**
   * Événement : Rejoindre une session existante
   * Reçoit : { sessionCode: string, pseudo: string }
   * Émet : session-joined ou error
   */
  socket.on('join-session', (data) => {
    const { sessionCode, pseudo } = data;
    
    const result = sessionManager.joinSession(sessionCode, pseudo, socket.id);
    
    if (result.success) {
      const session = result.session;
      const player = result.player;
      
      socket.join(session.id);
      
      socket.emit('session-joined', {
        sessionId: session.id,
        sessionCode: session.code,
        playerId: player.id,
        session: session.toJSON(false)
      });
      
      io.to(session.id).emit('player-joined', {
        player: player.toJSON(false),
        totalPlayers: session.players.length
      });
      
      console.log(`${pseudo} joined session ${session.code}`);
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  /**
   * Événement : Obtenir l'état actuel de la session
   * Reçoit : { sessionId: string }
   * Émet : session-state ou error
   */
  socket.on('get-session-state', (data) => {
    const { sessionId } = data;
    
    const session = sessionManager.getSession(sessionId);
    
    if (session) {
      const allVoted = session.allPlayersVoted();
      
      socket.emit('session-state', {
        session: session.toJSON(!allVoted)
      });
    } else {
      socket.emit('error', { message: 'Session not found' });
    }
  });

  /**
   * Événement : Déconnexion d'un joueur
   */
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    
    const sessions = sessionManager.getAllSessions();
    
    for (let session of sessions) {
      const player = session.getPlayerBySocketId(socket.id);
      
      if (player) {
        sessionManager.removePlayerFromSession(session.id, player.id);
        
        io.to(session.id).emit('player-left', {
          playerId: player.id,
          pseudo: player.pseudo,
          totalPlayers: session.players.length
        });
        
        console.log(`${player.pseudo} left session ${session.code} (disconnected)`);
        break;
      }
    }
  });
}

module.exports = handleSessionEvents;