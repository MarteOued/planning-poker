// Import des dépendances
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Initialisation de l'application Express
const app = express();
const server = http.createServer(app);

// Configuration de Socket.io avec CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Le frontend React sera sur ce port
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors()); // Autorise les requêtes depuis le frontend
app.use(express.json()); // Parse les requêtes JSON

// Port du serveur
const PORT = process.env.PORT || 5000;

// Route de test (pour vérifier que le serveur fonctionne)
app.get('/', (req, res) => {
  res.json({ message: 'Planning Poker Server is running!' });
});

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
  console.log(' Nouveau joueur connecté:', socket.id);
  
  // Quand un joueur se déconnecte
  socket.on('disconnect', () => {
    console.log(' Joueur déconnecté:', socket.id);
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(` Serveur lancé sur http://localhost:${PORT}`);
});

// Point d'entrée du serveur
console.log('Server minimal pour tests');