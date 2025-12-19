import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Key } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useSessionStore } from '../stores/sessionStore'

export default function JoinSessionPage() {
  const navigate = useNavigate()
  const { setIsPM, setUserName, setSessionId, setMode } = useSessionStore()
  
  const [pseudo, setPseudo] = useState('')
  const [sessionCode, setSessionCode] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!pseudo || pseudo.length < 3 || pseudo.length > 20) {
      newErrors.pseudo = 'Le pseudo doit contenir entre 3 et 20 caractères'
    }
    
    if (!sessionCode || sessionCode.length !== 6) {
      newErrors.sessionCode = 'Le code de session doit contenir 6 caractères'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSessionCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length <= 6) {
      setSessionCode(value)
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`http://localhost:3001/api/sessions/${sessionCode}`)
      const data = await response.json()
      
      if (data.success) {
        setSessionId(sessionCode)
        setIsPM(false)
        setUserName(pseudo)
        setMode(data.session.mode)
        
        navigate(`/waiting/${sessionCode}`)
      } else {
        setErrors({ 
          ...errors, 
          sessionCode: 'Session introuvable - Vérifiez le code' 
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      setErrors({ 
        ...errors, 
        sessionCode: 'Impossible de se connecter au serveur' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-xl mx-auto py-8">
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
            Retour au Menu
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
             Rejoindre une Session
          </h1>
          <p className="text-gray-600">Entrez le code fourni par l'organisateur</p>
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
                label="👤 Votre Pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ex: Marie Dubois"
                icon={User}
                error={errors.pseudo}
                helperText="Visible par tous les participants"
                required
              />

              {/* Code de session */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                   Code de Session <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                    <Key size={20} />
                  </div>
                  <input
                    type="text"
                    value={sessionCode}
                    onChange={handleSessionCodeChange}
                    placeholder="ABC123"
                    maxLength={6}
                    className={`
                      w-full px-4 py-3 pl-10 bg-blue-50 text-gray-800 text-center text-2xl font-bold tracking-widest rounded-xl 
                      border-2 transition-all duration-200
                      focus:outline-none focus:ring-2
                      ${errors.sessionCode 
                        ? 'border-red-500 focus:ring-red-200' 
                        : sessionCode.length === 6
                        ? 'border-emerald-500 focus:ring-emerald-200 bg-emerald-50'
                        : 'border-blue-300 focus:border-blue-500 focus:ring-blue-200'
                      }
                    `}
                  />
                </div>
                {errors.sessionCode && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.sessionCode}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-600">
                  Demandez le code à l'organisateur
                </p>
              </div>

              {/* Submit button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading || !pseudo || sessionCode.length !== 6}
                onClick={handleSubmit}
              >
                {loading ? ' Connexion...' : 'Rejoindre la Session'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Help text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 inline-block">
            <p className="text-blue-700 text-sm font-medium">
               Vous n'avez pas de code ? Demandez à votre Product Manager
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}