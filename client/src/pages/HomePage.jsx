import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UserCircle, Users } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
             Planning Poker
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Estimez vos fonctionnalités en équipe
          </motion.p>
        </div>

        {/* Cards de choix */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card PM */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -8 }}
            className="cursor-pointer"
            onClick={() => navigate('/pm-setup')}
          >
            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover border border-blue-100 transition-all duration-300 h-full">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <UserCircle size={48} className="text-blue-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Créer une Session
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Vous êtes le Product Manager ? Créez une session et invitez votre équipe.
                </p>
                
                <Button 
                  variant="primary" 
                  fullWidth
                  onClick={() => navigate('/pm-setup')}
                >
                  <UserCircle size={20} className="inline mr-2" />
                  Je suis PM
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Card Joueur */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -8 }}
            className="cursor-pointer"
            onClick={() => navigate('/join')}
          >
            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover border border-blue-100 transition-all duration-300 h-full">
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <Users size={48} className="text-purple-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Rejoindre une Session
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Vous avez un code de session ? Rejoignez votre équipe et commencez à voter.
                </p>
                
                <Button 
                  variant="secondary" 
                  fullWidth
                  onClick={() => navigate('/join')}
                >
                  <Users size={20} className="inline mr-2" />
                  Je suis Joueur
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 inline-block">
            <p className="text-blue-700 text-sm font-medium">
               Le PM configure la session, les joueurs votent sur chaque fonctionnalité
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}