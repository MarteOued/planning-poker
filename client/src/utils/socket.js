import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3001'

let socket = null

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false
    })
    
    socket.on('connect', () => {
      console.log(' Connecté au serveur Socket.io:', socket.id)
    })
    
    socket.on('disconnect', () => {
      console.log(' Déconnecté du serveur')
    })
  }
  
  return socket
}

export const getSocket = () => {
  if (!socket) {
    return initSocket()
  }
  return socket
}

export const connectSocket = () => {
  const socket = getSocket()
  if (!socket.connected) {
    socket.connect()
  }
}

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect()
  }
}