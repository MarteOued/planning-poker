const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

// Structure de données pour les sessions
const sessions = new Map()

// Helper pour générer un code de session
function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// API REST endpoint pour créer une session
app.post('/api/sessions/create', (req, res) => {
  const { userName, playerCount, mode, features } = req.body
  
  const sessionId = generateSessionCode()
  
  sessions.set(sessionId, {
    id: sessionId,
    pm: {
      name: userName,
      socketId: null,
      voted: false,
      vote: null
    },
    mode,
    playerCount,
    features,
    players: [],
    currentFeatureIndex: 0,
    currentRound: 1,
    votes: {},
    status: 'waiting', // waiting, playing, finished
    createdAt: Date.now(),
    estimations: []
  })
  
  console.log(`✅ Session créée: ${sessionId} par ${userName}`)
  
  res.json({ 
    success: true, 
    sessionId,
    session: sessions.get(sessionId)
  })
})

// API REST endpoint pour vérifier si une session existe
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params
  const session = sessions.get(sessionId)
  
  if (!session) {
    return res.status(404).json({ 
      success: false, 
      error: 'Session introuvable' 
    })
  }
  
  res.json({ 
    success: true, 
    session 
  })
})

// Socket.io events
io.on('connection', (socket) => {
  console.log(`🔌 Nouvelle connexion: ${socket.id}`)
  
  // Un joueur rejoint une session
  socket.on('join-session', ({ sessionId, userName, isPM }) => {
    const session = sessions.get(sessionId)
    
    if (!session) {
      socket.emit('error', { message: 'Session introuvable' })
      return
    }
    
    socket.join(sessionId)
    
    if (isPM) {
      // Le PM se connecte
      session.pm.socketId = socket.id
      session.pm.name = userName
      console.log(`👨‍💼 PM ${userName} a rejoint la session ${sessionId}`)
    } else {
      // Vérifier si le joueur existe déjà (éviter les doublons)
      const existingPlayer = session.players.find(p => p.name === userName)
      
      if (!existingPlayer) {
        // Un joueur normal se connecte
        const player = {
          id: socket.id,
          name: userName,
          voted: false,
          vote: null,
          isPM: false
        }
        
        session.players.push(player)
        console.log(`👤 Joueur ${userName} a rejoint la session ${sessionId}`)
        
        // Notifier les autres joueurs
        socket.to(sessionId).emit('player-joined', {
          player: userName,
          totalPlayers: session.players.length + 1
        })
      } else {
        // Le joueur existe déjà, mettre à jour son socketId
        existingPlayer.id = socket.id
        console.log(`🔄 Joueur ${userName} s'est reconnecté à la session ${sessionId}`)
      }
    }
    
    // Envoyer la mise à jour à tous les participants
    io.to(sessionId).emit('session-updated', {
      session: {
        id: session.id,
        pm: session.pm,
        mode: session.mode,
        playerCount: session.playerCount,
        features: session.features,
        players: session.players,
        currentFeatureIndex: session.currentFeatureIndex,
        status: session.status
      }
    })
    
    // Envoyer confirmation au joueur qui vient de rejoindre
    socket.emit('join-success', {
      sessionId,
      session: {
        id: session.id,
        pm: session.pm,
        mode: session.mode,
        playerCount: session.playerCount,
        features: session.features,
        players: session.players,
        currentFeatureIndex: session.currentFeatureIndex,
        status: session.status
      }
    })
  })
  
  // Le PM démarre la session
  socket.on('start-session', ({ sessionId }) => {
    const session = sessions.get(sessionId)
    
    if (!session) {
      socket.emit('error', { message: 'Session introuvable' })
      return
    }
    
    if (session.pm.socketId !== socket.id) {
      socket.emit('error', { message: 'Seul le PM peut démarrer la session' })
      return
    }
    
    session.status = 'playing'
    
    console.log(` Session ${sessionId} démarrée`)
    
    // Notifier tout le monde que la partie démarre
    io.to(sessionId).emit('session-started', {
      sessionId,
      currentFeature: session.features[session.currentFeatureIndex]
    })
  })
  
  // Un joueur vote
  socket.on('submit-vote', ({ sessionId, vote }) => {
    const session = sessions.get(sessionId)
    
    if (!session) {
      socket.emit('error', { message: 'Session introuvable' })
      return
    }
    
    // Enregistrer le vote
    session.votes[socket.id] = vote
    
    // Mettre à jour le statut du joueur
    const player = session.players.find(p => p.id === socket.id)
    if (player) {
      player.voted = true
      player.vote = vote
    }
    
    // Si c'est le PM qui vote
    if (session.pm.socketId === socket.id) {
      session.pm.voted = true
      session.pm.vote = vote
    }
    
    console.log(` Vote reçu dans ${sessionId}: ${vote}`)
    
    // Notifier tous les joueurs de la mise à jour des votes
    io.to(sessionId).emit('vote-updated', {
      votedCount: Object.keys(session.votes).length,
      totalPlayers: session.players.length + 1,
      totalFeatures: session.features.length,
      players: session.players,
      pm: session.pm
    })
    
    // Vérifier si tout le monde a voté
    const totalVoters = session.players.length + 1 // +1 pour le PM
    if (Object.keys(session.votes).length === totalVoters) {
      console.log(`✅ Tous les votes sont enregistrés pour ${sessionId}`)
      
      // Vérifier si tout le monde a voté café (☕)
      const allVotes = Object.values(session.votes)
      const allCoffee = allVotes.every(v => v === '☕')
      
      if (allCoffee) {
        // PAUSE CAFÉ : Sauvegarder l'état de la session
        console.log(`☕ Pause café dans ${sessionId} - Sauvegarde automatique`)
        
        const saveData = {
          sessionId: session.id,
          savedAt: new Date().toISOString(),
          pm: session.pm.name,
          mode: session.mode,
          currentFeatureIndex: session.currentFeatureIndex,
          features: session.features,
          estimations: session.estimations || []
        }
        
        // Envoyer la sauvegarde à tous les participants
        io.to(sessionId).emit('coffee-break', {
          message: '☕ Pause café ! Session sauvegardée automatiquement.',
          saveData
        })
        
        return
      }
      
      // Calculer le résultat selon le mode
      const votes = Object.values(session.votes).filter(v => typeof v === 'number')
      
      // Vérifier l'unanimité
      const uniqueVotes = [...new Set(votes)]
      const isUnanimous = uniqueVotes.length === 1
      
      // Incrémenter le tour
      if (!session.currentRound) {
        session.currentRound = 1
      }
      
      let estimation = null
      let needsNewRound = false
      let message = ''
      
      if (session.mode === 'strict') {
        // Mode STRICT : toujours unanimité
        if (isUnanimous) {
          estimation = votes[0]
          message = 'Unanimité atteinte !'
          // Enregistrer l'estimation
          session.estimations.push({
            featureId: session.features[session.currentFeatureIndex].id,
            featureName: session.features[session.currentFeatureIndex].name,
            estimation,
            rounds: session.currentRound,
            votes: session.votes,
            isUnanimous: true
          })
        } else {
          needsNewRound = true
          message = 'Pas d\'unanimité. Nouveau tour requis.'
        }
      } else if (session.mode === 'moyenne') {
        // Mode MOYENNE : 1er tour unanimité, puis moyenne
        if (session.currentRound === 1) {
          // Premier tour : unanimité obligatoire
          if (isUnanimous) {
            estimation = votes[0]
            message = 'Unanimité au premier tour !'
            // Enregistrer l'estimation
            session.estimations.push({
              featureId: session.features[session.currentFeatureIndex].id,
              featureName: session.features[session.currentFeatureIndex].name,
              estimation,
              rounds: session.currentRound,
              votes: session.votes,
              isUnanimous: true
            })
          } else {
            needsNewRound = true
            session.currentRound++
            message = 'Pas d\'unanimité au 1er tour. Nouveau tour avec moyenne.'
          }
        } else {
          // Tours suivants : moyenne
          const average = votes.reduce((a, b) => a + b, 0) / votes.length
          estimation = Math.round(average)
          message = 'Estimation calculée par moyenne.'
          // Enregistrer l'estimation
          session.estimations.push({
            featureId: session.features[session.currentFeatureIndex].id,
            featureName: session.features[session.currentFeatureIndex].name,
            estimation,
            rounds: session.currentRound,
            votes: session.votes,
            isUnanimous: false
          })
        }
      }
      
      // Révéler les votes
      io.to(sessionId).emit('all-voted', {
        votes: session.votes,
        players: session.players,
        pm: session.pm,
        result: {
          votes,
          estimation,
          needsNewRound,
          message,
          mode: session.mode,
          round: session.currentRound,
          isUnanimous,
          isSessionFinished: false,
          estimations: session.estimations
        }
      })
    }
  })
  
  // Passer à la feature suivante
  socket.on('next-feature', ({ sessionId }) => {
    const session = sessions.get(sessionId)
    
    if (!session) return
    
    if (session.pm.socketId !== socket.id) {
      socket.emit('error', { message: 'Seul le PM peut passer à la feature suivante' })
      return
    }
    
    // Reset des votes et du tour
    session.votes = {}
    session.currentRound = 1
    session.players.forEach(p => {
      p.voted = false
      p.vote = null
    })
    session.pm.voted = false
    session.pm.vote = null
    
    // Passer à la feature suivante
    session.currentFeatureIndex++
    
    if (session.currentFeatureIndex >= session.features.length) {
      // Fin de la session - LE PM DOIT CONFIRMER
      session.status = 'finished'
      
      console.log(`🏁 Session ${sessionId} terminée - ${session.estimations.length} features estimées`)
      
      // Envoyer les résultats finaux avec flag de fin
      io.to(sessionId).emit('all-voted', {
        votes: session.votes,
        players: session.players,
        pm: session.pm,
        result: {
          votes: [],
          estimation: null,
          needsNewRound: false,
          message: '🎉 Toutes les features ont été estimées !',
          mode: session.mode,
          round: session.currentRound,
          isUnanimous: false,
          isSessionFinished: true,  // FLAG IMPORTANT
          estimations: session.estimations
        }
      })
      
      console.log(`⏳ En attente que le PM télécharge les résultats de ${sessionId}...`)
    } else {
      // Feature suivante
      io.to(sessionId).emit('next-feature', {
        currentFeatureIndex: session.currentFeatureIndex,
        currentFeature: session.features[session.currentFeatureIndex]
      })
      console.log(`➡️ Session ${sessionId} - Feature ${session.currentFeatureIndex + 1}/${session.features.length}`)
    }
  })
  
  // Nouveau tour de vote
  socket.on('new-round', ({ sessionId }) => {
    const session = sessions.get(sessionId)
    
    if (!session) return
    
    if (session.pm.socketId !== socket.id) {
      socket.emit('error', { message: 'Seul le PM peut lancer un nouveau tour' })
      return
    }
    
    // Reset uniquement les votes, pas le tour
    session.votes = {}
    session.players.forEach(p => {
      p.voted = false
      p.vote = null
    })
    session.pm.voted = false
    session.pm.vote = null
    
    // Notifier tout le monde
    io.to(sessionId).emit('new-round-started', {
      round: session.currentRound,
      message: `Nouveau tour ${session.currentRound}`
    })
    
    console.log(`🔄 Session ${sessionId} - Nouveau tour ${session.currentRound}`)
  })
  
  // Chat: envoyer un message
  socket.on('send-message', ({ sessionId, message, userName }) => {
    const session = sessions.get(sessionId)
    
    if (!session) return
    
    const chatMessage = {
      id: Date.now(),
      userName,
      message,
      timestamp: new Date().toISOString()
    }
    
    // Envoyer à tout le monde dans la session
    io.to(sessionId).emit('new-message', chatMessage)
    
    console.log(`💬 Message dans ${sessionId} de ${userName}: ${message}`)
  })
  
  // Reprendre après une pause café
  socket.on('resume-from-break', ({ sessionId }) => {
    const session = sessions.get(sessionId)
    
    if (!session) return
    
    if (session.pm.socketId !== socket.id) {
      socket.emit('error', { message: 'Seul le PM peut reprendre la session' })
      return
    }
    
    // Notifier tout le monde que la session reprend
    io.to(sessionId).emit('session-resumed', {
      message: 'La session reprend !'
    })
    
    console.log(`▶️ Session ${sessionId} reprise après pause café`)
  })
  
  // Terminer la session manuellement
  socket.on('end-session-manually', ({ sessionId }) => {
    const session = sessions.get(sessionId)
    
    if (!session) {
      socket.emit('error', { message: 'Session introuvable' })
      return
    }
    
    if (session.pm.socketId !== socket.id) {
      socket.emit('error', { message: 'Seul le PM peut terminer la session' })
      return
    }
    
    session.status = 'finished'
    
    console.log(`🏁 Session ${sessionId} terminée manuellement par le PM`)
    
    // Envoyer les résultats avec flag de fin
    io.to(sessionId).emit('all-voted', {
      votes: session.votes,
      players: session.players,
      pm: session.pm,
      result: {
        votes: [],
        estimation: null,
        needsNewRound: false,
        message: 'Session terminée manuellement par le PM',
        mode: session.mode,
        round: session.currentRound,
        isUnanimous: false,
        isSessionFinished: true,
        estimations: session.estimations
      }
    })
  })
  
  // ========================================
  //  TIMER EVENTS - Synchronisation
  // ========================================
  
  // Mettre à jour le timer
  socket.on('timer-update', ({ sessionId, time, isRunning }) => {
    const session = sessions.get(sessionId)
    
    if (!session) return
    
    // Émettre à tous les clients de la session
    io.to(sessionId).emit('timer-updated', {
      time,
      isRunning
    })
    
    console.log(`⏱️ Timer mis à jour - Session: ${sessionId}, Time: ${time}s, Running: ${isRunning}`)
  })
  
  // Réinitialiser le timer
  socket.on('timer-reset', ({ sessionId }) => {
    const session = sessions.get(sessionId)
    
    if (!session) return
    
    // Émettre à tous les clients de la session
    io.to(sessionId).emit('timer-reset', {
      sessionId
    })
    
    console.log(`🔄 Timer réinitialisé - Session: ${sessionId}`)
  })
  
  // ========================================
  // FIN TIMER EVENTS
  // ========================================
  
  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`🔌 Déconnexion: ${socket.id}`)
    
    // Trouver la session du joueur
    sessions.forEach((session, sessionId) => {
      // Vérifier si c'est le PM
      if (session.pm.socketId === socket.id) {
        io.to(sessionId).emit('pm-disconnected', {
          message: 'Le PM s\'est déconnecté'
        })
        console.log(` PM déconnecté de la session ${sessionId}`)
      }
      
      // Vérifier si c'est un joueur
      const playerIndex = session.players.findIndex(p => p.id === socket.id)
      if (playerIndex !== -1) {
        const player = session.players[playerIndex]
        session.players.splice(playerIndex, 1)
        
        io.to(sessionId).emit('player-left', {
          player: player.name,
          totalPlayers: session.players.length + 1
        })
        
        console.log(`👋 Joueur ${player.name} a quitté la session ${sessionId}`)
      }
    })
  })
})

// Démarrer le serveur
const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(` Serveur Socket.io démarré sur le port ${PORT}`)
  console.log(` Frontend attendu sur http://localhost:5173`)
})