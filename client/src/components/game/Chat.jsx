import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle, X } from 'lucide-react'
import Button from '../ui/Button'
import { getSocket } from '../../utils/socket'

export default function Chat({ sessionId, userName, isOpen, onToggle }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const socket = getSocket()

    // Écouter les nouveaux messages
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socket.off('new-message')
    }
  }, [])

  useEffect(() => {
    // Scroll automatique vers le bas
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const socket = getSocket()
    socket.emit('send-message', {
      sessionId,
      userName,
      message: inputMessage.trim()
    })

    setInputMessage('')
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl z-50"
      >
        <MessageCircle size={28} />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={24} />
          <h3 className="font-bold text-lg">Chat d'équipe</h3>
        </div>
        <button
          onClick={onToggle}
          className="hover:bg-white/20 p-2 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p className="text-center">
              💬 Aucun message<br />
              <span className="text-sm">Commencez la discussion !</span>
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-3 ${msg.userName === userName ? 'text-right' : 'text-left'}`}
              >
                <div className={`inline-block max-w-[80%] ${
                  msg.userName === userName
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                } rounded-2xl px-4 py-2 shadow-sm`}>
                  {msg.userName !== userName && (
                    <p className="text-xs font-semibold mb-1 text-blue-600">
                      {msg.userName}
                    </p>
                  )}
                  <p className="break-words">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.userName === userName ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors shadow-md"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          {inputMessage.length}/200 caractères
        </p>
      </form>
    </motion.div>
  )
}