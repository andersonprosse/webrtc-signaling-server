const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// 1. Liberação de CORS no nível do Express
app.use(cors({
  origin: "https://digitalconnect4.sti-ia.org",
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);

// 2. Liberação de CORS no nível do Socket.io (O mais importante)
const io = new Server(server, {
  cors: {
    origin: "https://digitalconnect4.sti-ia.org", // Use o seu domínio exato
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'] // Inverte a ordem para priorizar WebSocket
});

app.get('/', (req, res) => {
  res.send('Digital Connect Signaling Server ON! 🚀');
});

io.on('connection', (socket) => {
  console.log('✅ Dispositivo Conectado:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', (data) => {
    socket.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
  });

  socket.on('disconnect', () => console.log('❌ Dispositivo desconectado'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});