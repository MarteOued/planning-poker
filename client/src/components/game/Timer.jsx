import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Clock, Settings } from 'lucide-react'
import { getSocket } from '../../utils/socket'

export default function Timer({ isPM, sessionId, onTimeUp }) {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [targetMinutes, setTargetMinutes] = useState(5)
  const [targetSeconds, setTargetSeconds] = useState(0)

  useEffect(() => {
    const socket = getSocket()

    // Écouter les mises à jour du timer
    socket.on('timer-updated', (data) => {
      console.log('⏱️ Timer mis à jour:', data)
      setTime(data.time)
      setIsRunning(data.isRunning)
    })

    // Écouter le reset du timer
    socket.on('timer-reset', (data) => {
      console.log('🔄 Timer réinitialisé')
      setTime(0)
      setIsRunning(false)
    })

    return () => {
      socket.off('timer-updated')
      socket.off('timer-reset')
    }
  }, [])

  useEffect(() => {
    let interval
    if (isRunning && isPM) {
      interval = setInterval(() => {
        setTime(prev => {
          const newTime = prev + 1
          // Émettre la mise à jour
          const socket = getSocket()
          socket.emit('timer-update', {
            sessionId,
            time: newTime,
            isRunning: true
          })
          
          // Vérifier si le temps cible est atteint
          const targetTime = targetMinutes * 60 + targetSeconds
          if (targetTime > 0 && newTime >= targetTime) {
            handlePlayPause()
            if (onTimeUp) onTimeUp()
          }
          
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, isPM, targetMinutes, targetSeconds])

  const handlePlayPause = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!isPM) return
    
    const newState = !isRunning
    setIsRunning(newState)
    
    const socket = getSocket()
    socket.emit('timer-update', {
      sessionId,
      time,
      isRunning: newState
    })
  }

  const handleReset = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isPM) return
    
    setTime(0)
    setIsRunning(false)
    
    const socket = getSocket()
    socket.emit('timer-reset', { sessionId })
  }

  const handleSetTarget = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowSettings(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const totalTargetSeconds = targetMinutes * 60 + targetSeconds
  const progress = totalTargetSeconds > 0 ? (time / totalTargetSeconds) * 100 : 0

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">⏱️ Chronomètre</h3>
        {isPM && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowSettings(!showSettings)
            }}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Settings size={18} className="text-blue-600" />
          </button>
        )}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && isPM && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock size={16} />
                Objectif de temps
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border-2 border-blue-300 rounded-lg text-center font-bold text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Secondes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={targetSeconds}
                    onChange={(e) => setTargetSeconds(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border-2 border-blue-300 rounded-lg text-center font-bold text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSetTarget}
                className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                Définir l'objectif
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Timer Display */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-4 border border-blue-200 relative overflow-hidden">
        {/* Progress bar si objectif défini */}
        {totalTargetSeconds > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              className={`h-full ${
                progress >= 100 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
            />
          </div>
        )}
        
        <div className="text-center">
          <motion.div
            animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            {formatTime(time)}
          </motion.div>
          
          {totalTargetSeconds > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Objectif: {formatTime(totalTargetSeconds)}
              {progress >= 100 && (
                <span className="ml-2 text-red-500 font-bold">⏰ Temps écoulé!</span>
              )}
            </div>
          )}
          
          <p className="text-sm text-gray-600 mt-1">
            {isRunning ? '⏸️ En cours...' : '▶️ En pause'}
          </p>
        </div>
      </div>

      {/* Controls */}
      {isPM ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePlayPause}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold
              transition-all duration-200 shadow-md hover:shadow-lg
              ${isRunning 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
              }
            `}
          >
            {isRunning ? (
              <>
                <Pause size={18} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Démarrer</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-white border-2 border-blue-300 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      ) : (
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            🔒 Seul le PM peut contrôler le chronomètre
          </p>
        </div>
      )}

      {/* Time indicators */}
      <div className="mt-4 pt-4 border-t border-blue-100">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className={`p-2 rounded-lg ${time < 120 ? 'bg-blue-100 border-2 border-blue-400' : 'bg-blue-50'}`}>
            <p className="text-blue-600 font-medium">Rapide</p>
            <p className="text-gray-800 font-bold">{'< 2min'}</p>
          </div>
          <div className={`p-2 rounded-lg ${time >= 120 && time <= 300 ? 'bg-purple-100 border-2 border-purple-400' : 'bg-purple-50'}`}>
            <p className="text-purple-600 font-medium">Normal</p>
            <p className="text-gray-800 font-bold">2-5min</p>
          </div>
          <div className={`p-2 rounded-lg ${time > 300 ? 'bg-amber-100 border-2 border-amber-400' : 'bg-amber-50'}`}>
            <p className="text-amber-600 font-medium">Long</p>
            <p className="text-gray-800 font-bold">{"> 5min"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}