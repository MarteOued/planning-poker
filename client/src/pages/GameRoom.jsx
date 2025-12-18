import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import VotingCard from '../components/game/VotingCard'
import Chat from '../components/game/Chat'
import Timer from '../components/game/Timer'
import { useSessionStore } from '../stores/sessionStore'
import { getSocket } from '../utils/socket'

const CARD_VALUES = [0, 1, 2, 3, 5, 8, 13, 20, 40, 100, '?', '☕']

export default function GameRoom() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { userName, isPM, features, mode, currentFeatureIndex: storeFeatureIndex, nextFeature: storeNextFeature } = useSessionStore()
  
  const [selectedCard, setSelectedCard] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [players, setPlayers] = useState([])
  const [pmData, setPmData] = useState(null)
  const [currentFeature, setCurrentFeature] = useState(null)
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0)
  const [votedCount, setVotedCount] = useState(0)
  const [allVotes, setAllVotes] = useState({})
  const [result, setResult] = useState(null)
  const [toast, setToast] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [totalFeatures, setTotalFeatures] = useState(features?.length || 10)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [breakData, setBreakData] = useState(null)

  useEffect(() => {
    const socket = getSocket()

    socket.on('vote-updated', (data) => {
      console.log('🗳️ Votes mis à jour:', data)
      setVotedCount(data.votedCount)
      setPlayers(data.players)
      setPmData(data.pm)
      
      if (data.totalFeatures) {
        setTotalFeatures(data.totalFeatures)
      }
    })

    socket.on('all-voted', (data) => {
      console.log('Tous ont voté!', data)
      setAllVotes(data.votes)
      setPlayers(data.players)
      setPmData(data.pm)
      setResult(data.result)
      setShowResults(true)
      
      // Afficher un toast différent selon l'état
      if (data.result?.isSessionFinished) {
        showToast(' Toutes les features ont été estimées ! Le PM peut télécharger les résultats.', 'info')
      } else {
        showToast('Tous les joueurs ont voté !', 'success')
      }
    })
    
    socket.on('coffee-break', (data) => {
      console.log(' Pause café!', data)
      setIsOnBreak(true)
      setBreakData(data.saveData)
      showToast(' Pause café ! Session sauvegardée.', 'success')
      
      const blob = new Blob([JSON.stringify(data.saveData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `planning-poker-save-${data.saveData.sessionId}.json`
      a.click()
      URL.revokeObjectURL(url)
    })
    
    socket.on('new-round-started', (data) => {
      console.log(' Nouveau tour:', data)
      resetVoting()
      showToast(data.message, 'info')
    })
    
    socket.on('session-resumed', (data) => {
      console.log(' Session reprise:', data)
      setIsOnBreak(false)
      resetVoting()
      showToast(data.message, 'success')
    })

    socket.on('next-feature', (data) => {
      console.log(' Feature suivante:', data)
      console.log('Index reçu:', data.currentFeatureIndex, '/ Total:', features?.length)
      setCurrentFeature(data.currentFeature)
      setCurrentFeatureIndex(data.currentFeatureIndex)
      storeNextFeature()
      resetVoting()
      showToast(` Feature ${data.currentFeatureIndex + 1}: ${data.currentFeature.name || data.currentFeature.title}`, 'info')
    })

    socket.on('error', (data) => {
      showToast(` ${data.message}`, 'error')
    })

    if (features && features.length > 0) {
      setCurrentFeature(features[0])
    }

    return () => {
      socket.off('vote-updated')
      socket.off('all-voted')
      socket.off('coffee-break')
      socket.off('new-round-started')
      socket.off('session-resumed')
      socket.off('next-feature')
      socket.off('error')
    }
  }, [navigate, features])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const resetVoting = () => {
    setSelectedCard(null)
    setHasVoted(false)
    setShowResults(false)
    setVotedCount(0)
    setAllVotes({})
    setResult(null)
    setIsOnBreak(false)
  }

  const handleCardClick = (value) => {
    if (!hasVoted) {
      setSelectedCard(value)
    }
  }

  const handleValidateVote = () => {
    const socket = getSocket()
    socket.emit('submit-vote', {
      sessionId,
      vote: selectedCard
    })
    setHasVoted(true)
    showToast(' Vote enregistré !', 'success')
  }

  const handleNextFeature = () => {
    const socket = getSocket()
    socket.emit('next-feature', { sessionId })
  }
  
  const handleNewRound = () => {
    const socket = getSocket()
    socket.emit('new-round', { sessionId })
  }
  
  const handleResumeFromBreak = () => {
    const socket = getSocket()
    socket.emit('resume-from-break', { sessionId })
  }
  
  const handleEndSession = () => {
    showToast(' Téléchargement des résultats...', 'success')
    
    // Préparer les données de résultats
    const resultsData = {
      sessionId,
      finishedAt: new Date().toISOString(),
      mode,
      totalFeatures: features?.length || 0,
      estimatedFeatures: result?.estimations?.length || 0,
      pm: pmData?.name || userName,
      players: players.map(p => p.name),
      estimations: result?.estimations || [],
      features: features?.map((feature, index) => ({
        id: feature.id || index,
        name: feature.name || feature.title,
        description: feature.description,
        priority: feature.priority,
        assignedTo: feature.assignedTo,
        estimation: result?.estimations?.[index]?.estimation || 'Non estimée',
        rounds: result?.estimations?.[index]?.rounds || 0,
        isUnanimous: result?.estimations?.[index]?.isUnanimous || false
      })),
      summary: {
        totalStoryPoints: result?.estimations?.reduce((sum, est) => sum + (est.estimation || 0), 0) || 0,
        averagePerFeature: result?.estimations?.length 
          ? Math.round((result.estimations.reduce((sum, est) => sum + (est.estimation || 0), 0) / result.estimations.length) * 10) / 10 
          : 0,
        totalRounds: result?.estimations?.reduce((sum, est) => sum + (est.rounds || 1), 0) || 0,
        unanimousDecisions: result?.estimations?.filter(est => est.isUnanimous).length || 0,
        averageRoundsPerFeature: result?.estimations?.length 
          ? Math.round((result.estimations.reduce((sum, est) => sum + (est.rounds || 1), 0) / result.estimations.length) * 10) / 10 
          : 0
      }
    }
    
    // Télécharger le fichier JSON
    const blob = new Blob([JSON.stringify(resultsData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `planning-poker-results-${sessionId}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    setTimeout(() => {
      const socket = getSocket()
      socket.disconnect()
      navigate('/')
    }, 1500)
  }

  const handleEndSessionManually = () => {
    if (window.confirm('Êtes-vous sûr de vouloir terminer la session maintenant ? Les features non estimées seront ignorées.')) {
      const socket = getSocket()
      socket.emit('end-session-manually', { sessionId })
      showToast('Terminaison de la session en cours...', 'warning')
    }
  }

  const handleQuit = () => {
    const socket = getSocket()
    socket.disconnect()
    navigate('/')
  }

  const calculateStats = () => {
    const numericVotes = Object.values(allVotes).filter(v => typeof v === 'number')
    if (numericVotes.length === 0) return { average: 0, median: 0, min: 0, max: 0 }

    const sorted = [...numericVotes].sort((a, b) => a - b)
    const average = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
    const median = sorted[Math.floor(sorted.length / 2)]
    const min = Math.min(...numericVotes)
    const max = Math.max(...numericVotes)

    return { average: average.toFixed(1), median, min, max }
  }

  const stats = showResults && result ? calculateStats() : null
  const totalPlayers = (players?.length || 0) + 1

  const feature = currentFeature || {
    name: 'Authentification utilisateur',
    description: 'Permettre la connexion par email et mot de passe avec validation forte',
    priority: 'Haute',
    assignedTo: 'Backend Team'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
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

      <div className="max-w-7xl mx-auto py-4">
        {/* Header - Style Bleu/Blanc */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-blue-100">
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Feature Card - Style moderne */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-card border border-blue-100">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm text-blue-600 font-medium">
                    Feature {currentFeatureIndex + 1}/{totalFeatures}
                  </h3>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-full">
                    <span className="text-white text-xs font-bold">
                      {Math.round(((currentFeatureIndex + 1) / totalFeatures) * 100)}% complété
                    </span>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  📋 {feature.name || feature.title}
                </h2>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex gap-4 text-sm">
                  {feature.priority && (
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="text-blue-600">🏷️ Priorité:</span>
                      <span className="text-gray-800 font-semibold">{feature.priority}</span>
                    </div>
                  )}
                  {feature.assignedTo && (
                    <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                      <span className="text-purple-600">👤 Assigné:</span>
                      <span className="text-gray-800 font-semibold">{feature.assignedTo}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Voting section */}
            <AnimatePresence mode="wait">
              {isOnBreak ? (
                <motion.div
                  key="coffee-break"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="bg-white rounded-2xl p-8 shadow-card border border-blue-100">
                    <div className="text-center py-12">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-8xl mb-6"
                      >
                        ☕
                      </motion.div>
                      
                      <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Pause Café !
                      </h2>
                      
                      <p className="text-gray-600 mb-6">
                        Tous les joueurs ont choisi la carte café.<br />
                        La session a été automatiquement sauvegardée.
                      </p>
                      
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-6 max-w-md mx-auto">
                        <p className="text-blue-600 text-sm mb-2">
                           Fichier de sauvegarde téléchargé
                        </p>
                        <p className="text-gray-800 font-mono text-xs">
                          planning-poker-save-{sessionId}.json
                        </p>
                      </div>
                      
                      {isPM ? (
                        <div className="space-y-3 max-w-md mx-auto">
                          <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleResumeFromBreak}
                          >
                             Reprendre la Session
                          </Button>
                          <p className="text-sm text-gray-500">
                             Vous pouvez aussi quitter et reprendre plus tard avec le fichier de sauvegarde
                          </p>
                        </div>
                      ) : (
                        <motion.p
                          className="text-gray-500"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                           En attente que le PM reprenne la session...
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : !showResults ? (
                <motion.div
                  key="voting"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-card border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      {hasVoted ? 'Vote enregistré' : 'Sélectionnez votre carte'}
                    </h3>
                    
                    {/* Cards grid */}
                    <div className="grid grid-cols-6 gap-3 mb-6">
                      {CARD_VALUES.map((value) => (
                        <VotingCard
                          key={value}
                          value={value}
                          isSelected={selectedCard === value}
                          isDisabled={hasVoted}
                          onClick={handleCardClick}
                        />
                      ))}
                    </div>

                    {/* Validate button */}
                    {selectedCard && !hasVoted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          onClick={handleValidateVote}
                        >
                          ✓ Valider mon Vote
                        </Button>
                      </motion.div>
                    )}

                    {/* Waiting message */}
                    {hasVoted && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center space-y-2"
                      >
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
                          <span> </span>
                          <span>Vote enregistré avec succès !</span>
                        </div>
                        <motion.p
                          className="text-gray-500"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          En attente des autres joueurs... ({votedCount}/{totalPlayers} ont voté)
                        </motion.p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-card border border-blue-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                       Résultats du Vote
                    </h3>
                    
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 mb-6">
                      <p className="text-emerald-600 text-center font-semibold">
                        {result?.isSessionFinished 
                          ? 'Toutes les features ont été estimées !' 
                          : 'Tous les joueurs ont voté !'
                        }
                      </p>
                    </div>

                    {/* Votes display */}
                    <div className="space-y-3 mb-6">
                      <h4 className="text-gray-800 font-semibold mb-3">Votes des joueurs :</h4>
                      
                      {/* PM vote */}
                      {pmData && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4"
                        >
                          <span className="text-gray-800 font-medium w-32">
                            {pmData.name} 
                            <span className="text-xs text-amber-600 ml-1">(PM)</span>
                          </span>
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-bold text-xl min-w-[60px] text-center shadow-md">
                            {pmData.vote}
                          </div>
                          <div className="flex-1 bg-blue-100 h-3 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(typeof pmData.vote === 'number' ? pmData.vote / 13 : 0) * 100}%` }}
                              transition={{ delay: 0.2, duration: 0.5 }}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Players votes */}
                      {players.map((player, idx) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (idx + 1) * 0.1 }}
                          className="flex items-center gap-4"
                        >
                          <span className="text-gray-800 font-medium w-32">{player.name}</span>
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-bold text-xl min-w-[60px] text-center shadow-md">
                            {player.vote}
                          </div>
                          <div className="flex-1 bg-blue-100 h-3 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(typeof player.vote === 'number' ? player.vote / 13 : 0) * 100}%` }}
                              transition={{ delay: (idx + 1) * 0.1 + 0.2, duration: 0.5 }}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Analysis */}
                    {stats && stats.average > 0 && (
                      <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                        <h4 className="text-gray-800 font-semibold mb-3">📊 Analyse :</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-3 rounded-lg">
                            <span className="text-blue-600">Moyenne:</span>
                            <span className="text-gray-800 font-bold ml-2">{stats.average}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="text-blue-600">Médiane:</span>
                            <span className="text-gray-800 font-bold ml-2">{stats.median}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="text-blue-600">Min:</span>
                            <span className="text-gray-800 font-bold ml-2">{stats.min}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="text-blue-600">Max:</span>
                            <span className="text-gray-800 font-bold ml-2">{stats.max}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Result */}
                    {result && (
                      result.isSessionFinished ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-4 mb-6">
                          <h3 className="text-2xl font-bold text-green-700 text-center mb-2">
                             Session Terminée !
                          </h3>
                          <p className="text-green-600 text-center mb-4">
                            Toutes les {totalFeatures} features ont été estimées avec succès.
                          </p>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-700 mb-2">
                              📊 <strong>Résumé :</strong>
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Mode : <strong className="text-gray-800 capitalize">{mode}</strong></li>
                              <li>• Features estimées : <strong className="text-gray-800">{result.estimations?.length || totalFeatures}</strong></li>
                              <li>• Session : <strong className="text-gray-800">{sessionId}</strong></li>
                            </ul>
                          </div>
                        </div>
                      ) : result.needsNewRound ? (
                        <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 mb-6">
                          <p className="text-amber-700 text-center font-bold text-xl">
                             {result.message}
                          </p>
                          <p className="text-amber-600 text-center text-sm mt-1">
                            Mode: {result.mode === 'strict' ? 'Unanimité (toujours unanimité)' : `Moyenne (tour ${result.round})`}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-4 mb-6">
                          <p className="text-emerald-700 text-center font-bold text-xl">
                             ESTIMATION VALIDÉE: {result.estimation} points
                          </p>
                          <p className="text-emerald-600 text-center text-sm mt-1">
                            {result.message}
                          </p>
                        </div>
                      )
                    )}

                    {/* Actions */}
                    {isPM ? (
                      <div className="space-y-3">
                        {result && result.isSessionFinished ? (
                          // Fin de session
                          <div>
                            <Button variant="success" size="lg" fullWidth onClick={handleEndSession}>
                               Télécharger les Résultats et Terminer
                            </Button>
                          </div>
                        ) : result && result.needsNewRound ? (
                          <Button variant="primary" size="lg" fullWidth onClick={handleNewRound}>
                             Nouveau Tour de Vote
                          </Button>
                        ) : (
                          <>
                            <Button variant="primary" size="lg" fullWidth onClick={handleNextFeature}>
                               Feature Suivante
                            </Button>
                            <Button variant="secondary" size="lg" fullWidth onClick={handleNewRound}>
                               Refaire un Tour
                            </Button>
                          </>
                        )}
                        
                        {/* Bouton pour terminer manuellement (optionnel) */}
                        {isPM && !result?.isSessionFinished && currentFeatureIndex < totalFeatures - 1 && (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="mt-2"
                            onClick={handleEndSessionManually}
                          >
                              Terminer la Session Maintenant
                          </Button>
                        )}
                      </div>
                    ) : (
                      <motion.p
                        className="text-center text-gray-500"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {result && result.isSessionFinished 
                          ? 'Session terminée ! En attente que le PM télécharge les résultats...'
                          : 'En attente de la décision du PM...'
                        }
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Players */}
          <div className="lg:col-span-1 space-y-6">
            {/* Players Card */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-blue-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Joueurs ({totalPlayers})</h3>
              <div className="space-y-3">
                {/* PM */}
                {pmData && (
                  <div
                    className={`
                      p-3 rounded-xl flex items-center justify-between transition-all
                      ${pmData.name === userName ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {pmData.voted ? (
                        <span className="text-emerald-500">✓</span>
                      ) : (
                        <span className="text-gray-400">⏳</span>
                      )}
                      <span className="text-gray-800 text-sm font-medium">{pmData.name}</span>
                      <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs rounded-full font-bold">
                        PM
                      </span>
                      {pmData.name === userName && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-bold">
                          VOUS
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Players */}
                {players.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`
                      p-3 rounded-xl flex items-center justify-between transition-all
                      ${player.name === userName ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {player.voted ? (
                        <span className="text-emerald-500">✓</span>
                      ) : (
                        <span className="text-gray-400">⏳</span>
                      )}
                      <span className="text-gray-800 text-sm font-medium">{player.name}</span>
                      {player.name === userName && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-bold">
                          VOUS
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Progress */}
              <div className="mt-4 pt-4 border-t border-blue-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-600 font-medium">Votes:</span>
                  <span className="text-gray-800 font-bold">{votedCount}/{totalPlayers}</span>
                </div>
                <div className="w-full bg-blue-100 h-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(votedCount / totalPlayers) * 100}%` }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center font-medium">
                  {Math.round((votedCount / totalPlayers) * 100)}% complété
                </p>
              </div>
            </div>
            
            {/* Timer */}
            <Timer 
              isPM={isPM}
              sessionId={sessionId}
              onTimeUp={() => showToast('Temps écoulé !', 'warning')} 
            />
          </div>
        </div>
      </div>
      
      {/* Chat Component */}
      <Chat
        sessionId={sessionId}
        userName={userName}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  )
}