import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Users, Upload, Check } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useSessionStore } from '../stores/sessionStore'

export default function PMSetupPage() {
  const navigate = useNavigate()
  const { setIsPM, setUserName, setMode, setFeatures, setSessionId } = useSessionStore()
  
  const [pseudo, setPseudo] = useState('')
  const [playerCount, setPlayerCount] = useState(4)
  const [selectedMode, setSelectedMode] = useState('strict')
  const [backlogFile, setBacklogFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!pseudo || pseudo.length < 3) {
      newErrors.pseudo = 'Le pseudo doit contenir au moins 3 caractères'
    }
    
    if (playerCount < 2 || playerCount > 20) {
      newErrors.playerCount = 'Entre 2 et 20 joueurs'
    }
    
    if (!backlogFile) {
      newErrors.backlog = 'Veuillez charger un fichier backlog'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/json') {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result)
          if (json.features && Array.isArray(json.features)) {
            setBacklogFile(file)
            setFeatures(json.features)
            setErrors({ ...errors, backlog: null })
          } else {
            setErrors({ ...errors, backlog: 'Format JSON invalide' })
          }
        } catch (err) {
          setErrors({ ...errors, backlog: 'Fichier JSON invalide' })
        }
      }
      reader.readAsText(file)
    } else {
      setErrors({ ...errors, backlog: 'Format JSON requis' })
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:3001/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: pseudo,
          playerCount: playerCount,
          mode: selectedMode,
          features: useSessionStore.getState().features
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSessionId(data.sessionId)
        setIsPM(true)
        setUserName(pseudo)
        setMode(selectedMode)
        
        navigate(`/waiting/${data.sessionId}`)
      } else {
        setErrors({ ...errors, submit: 'Erreur lors de la création de la session' })
      }
    } catch (error) {
      console.error('Erreur:', error)
      setErrors({ ...errors, submit: 'Impossible de se connecter au serveur' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft size={20} className="inline mr-2" />
            Retour
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
             Créer une Session PM
          </h1>
          <p className="text-gray-600">Configurez votre session Planning Poker</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-card border border-blue-100">
            <div className="space-y-6">
              {/* Pseudo */}
              <Input
                label="👤 Votre Pseudo (PM)"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ex: Pierre Martin"
                icon={User}
                error={errors.pseudo}
                helperText="Visible par tous les participants"
                required
              />

              {/* Nombre de joueurs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👥 Nombre de Joueurs <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={playerCount}
                    onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                    className="w-24 px-4 py-2.5 bg-blue-50 text-gray-800 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-semibold">
                    {playerCount} joueurs
                  </span>
                </div>
                {errors.playerCount && (
                  <p className="mt-1 text-sm text-red-500">{errors.playerCount}</p>
                )}
              </div>

              {/* Mode de vote */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                   Mode de Vote <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedMode('strict')
                    }}
                    className={`
                      cursor-pointer rounded-xl p-4 border-2 transition-all duration-300
                      ${selectedMode === 'strict' 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md' 
                        : 'border-blue-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="text-center">
                      {selectedMode === 'strict' && (
                        <div className="flex justify-end mb-2">
                          <Check size={20} className="text-blue-600" />
                        </div>
                      )}
                      <h3 className="font-bold text-gray-800 mb-2">Unanimité</h3>
                      <p className="text-sm text-gray-600">Tous les tours en unanimité</p>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedMode('moyenne')
                    }}
                    className={`
                      cursor-pointer rounded-xl p-4 border-2 transition-all duration-300
                      ${selectedMode === 'moyenne' 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md' 
                        : 'border-blue-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="text-center">
                      {selectedMode === 'moyenne' && (
                        <div className="flex justify-end mb-2">
                          <Check size={20} className="text-blue-600" />
                        </div>
                      )}
                      <h3 className="font-bold text-gray-800 mb-2">Moyenne</h3>
                      <p className="text-sm text-gray-600">1er tour unanimité, puis moyenne</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Upload backlog */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                   Fichier Backlog (JSON) <span className="text-red-500">*</span>
                </label>
                <div
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                    transition-all duration-200
                    ${backlogFile 
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50' 
                      : 'border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50'
                    }
                  `}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {backlogFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <Check size={24} className="text-blue-600" />
                      <div>
                        <p className="text-blue-700 font-semibold">{backlogFile.name}</p>
                        <p className="text-sm text-gray-600">Cliquez pour changer</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} className="mx-auto mb-3 text-blue-500" />
                      <p className="text-gray-800 font-medium mb-1">Cliquez pour télécharger</p>
                      <p className="text-sm text-gray-600">Format JSON uniquement</p>
                    </div>
                  )}
                </div>
                {errors.backlog && (
                  <p className="mt-2 text-sm text-red-500">{errors.backlog}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Format attendu : {`{"features": [{"id": 1, "title": "...", "description": "..."}]}`}
                </p>
              </div>

              {/* Submit button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? '⏳ Création en cours...' : '🚀 Créer la Session'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}