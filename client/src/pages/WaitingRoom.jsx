import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Copy, Check } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useSessionStore } from '../stores/sessionStore'
import { getSocket, connectSocket } from '../utils/socket'

export default function WaitingRoom() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { userName, isPM, mode, setPlayers } = useSessionStore()
  
  const [copied, setCopied] = useState(false)
  const [players, setPlayersState] = useState([])
  const [pmName, setPmName] = useState(userName)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const socket = getSocket()
    connectSocket()

    let hasJoined = false

    const joinSession = () => {
      if (!hasJoined) {
        hasJoined = true
        socket.emit('join-session', {
          sessionId,
          userName,
          isPM
        })
      }
    }

    if (socket.connected) {
      joinSession()
    } else {
      socket.once('connect', joinSession)
    }

    socket.on('join-success', (data) => {
      console.log('✅ Rejoint la session:', data)
      console.log('📊 PlayerCount:', data.session?.playerCount)
      setSessionInfo(data.session)
      setPmName(data.session.pm.name)
      setPlayersState(data.session.players)
    })

    socket.on('session-updated', (data) => {
      console.log('🔄 Session mise à jour:', data)
      console.log('📊 PlayerCount:', data.session?.playerCount)
      setSessionInfo(data.session)
      setPlayersState(data.session.players)
      setPmName(data.session.pm.name)
      setPlayers(data.session.players)
    })

    socket.on('player-joined', (data) => {
      showToast(`✨ ${data.player} a rejoint la session (${data.totalPlayers})`)
    })

    socket.on('player-left', (data) => {
      showToast(`👋 ${data.player} a quitté la session (${data.totalPlayers})`, 'warning')
    })

    socket.on('session-started', (data) => {
      console.log(' Session démarrée!')
      showToast(' La session démarre !', 'success')
      setTimeout(() => {
        navigate(`/game/${sessionId}`)
      }, 1500)
    })

    socket.on('pm-disconnected', (data) => {
      showToast('⚠️ Le PM s\'est déconnecté - Session en pause', 'error')
    })

    socket.on('error', (data) => {
      showToast(`❌ ${data.message}`, 'error')
    })

    return () => {
      socket.off('join-success')
      socket.off('session-updated')
      socket.off('player-joined')
      socket.off('player-left')
      socket.off('session-started')
      socket.off('pm-disconnected')
      socket.off('error')
    }
  }, [sessionId, userName, isPM, navigate])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStart = () => {
    const socket = getSocket()
    socket.emit('start-session', { sessionId })
  }

  const handleQuit = () => {
    const socket = getSocket()
    socket.disconnect()
    navigate('/')
  }

  const totalPlayers = players.length + 1
  const maxPlayers = sessionInfo?.playerCount || 5

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Toast notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl ${
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'warning' ? 'bg-amber-500' :
            toast.type === 'success' ? 'bg-emerald-500' :
            'bg-blue-500'
          } text-white font-semibold`}
        >
          {toast.message}
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <span className="text-blue-600 text-sm font-medium">Session:</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-wider">
              {sessionId}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-800 font-semibold">{userName}</span>
              {isPM && (
                <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs rounded-full font-bold shadow-md">
                  PM
                </span>
              )}
            </div>
            <Button variant="danger" size="sm" onClick={handleQuit}>
              Quitter
            </Button>
          </div>
        </div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
             Salle d'Attente
          </h1>
          <motion.p
            className="text-xl text-gray-600"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⏳ En attente du démarrage de la session...
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Session info */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4"> Informations</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-600 font-medium">Code Session:</span>
                <span className="font-bold text-gray-800">{sessionId}</span>
              </div>
              <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-600 font-medium">Organisateur:</span>
                <span className="font-bold text-gray-800">
                  {isPM ? `${userName} (Vous)` : pmName}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-600 font-medium">Mode:</span>
                <span className="font-bold text-gray-800 capitalize">{mode}</span>
              </div>
              <div className="flex justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <span className="text-blue-600 font-medium">Places:</span>
                <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {totalPlayers}/{maxPlayers}
                </span>
              </div>
            </div>
          </div>

          {/* Players list */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              👥 Joueurs Connectés ({totalPlayers}/{maxPlayers})
            </h3>
            <div className="space-y-3">
              {/* PM */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isPM ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500 text-lg">✓</span>
                  <span className="font-semibold text-gray-800">{pmName}</span>
                  <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs rounded-full font-bold">
                    PM
                  </span>
                  {isPM && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-bold">
                      VOUS
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">Organisateur</span>
              </motion.div>

              {/* Joueurs */}
              {players.map((player, idx) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (idx + 1) * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    player.name === userName ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-500 text-lg">✓</span>
                    <span className="font-semibold text-gray-800">{player.name}</span>
                    {player.name === userName && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-bold">
                        VOUS
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">En attente...</span>
                </motion.div>
              ))}
            </div>
            {totalPlayers < maxPlayers && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-sm text-blue-700 font-medium">
                  📊 En attente de {maxPlayers - totalPlayers} joueurs supplémentaires...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-blue-100 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Prochaines Étapes</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="text-gray-800 font-medium">Le PM va charger le backlog</p>
                <p className="text-sm text-gray-600">Liste des fonctionnalités à estimer</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="text-gray-800 font-medium">Tous les joueurs recevront la notification</p>
                <p className="text-sm text-gray-600">Vous serez alerté automatiquement</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="text-gray-800 font-medium">Le jeu démarrera automatiquement</p>
                <p className="text-sm text-gray-600">Préparez-vous à voter !</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl text-center border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">⏱️ Temps d'attente moyen: 2-3 minutes</p>
          </div>
        </div>

        {/* Share code */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-blue-100 mb-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4 font-medium"> Partagez ce code avec vos collègues:</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-widest">
                {sessionId}
              </span>
              <Button
                variant={copied ? "success" : "secondary"}
                onClick={copySessionCode}
              >
                {copied ? <Check size={20} className="inline mr-2" /> : <Copy size={20} className="inline mr-2" />}
                {copied ? 'Copié !' : 'Copier'}
              </Button>
            </div>
          </div>
        </div>

        {/* PM controls */}
        {isPM && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleStart}
            >
              Démarrer la Session (PM uniquement)
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}