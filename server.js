const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// 1. Configuração Robusta de CORS para Express
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

const server = http.createServer(app);

// 2. Configuração Profissional do Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    credentials: true
  },
  // TRAVA O PROTOCOLO: Só aceita WebSocket para evitar erro 426
  transports: ['websocket'], 
  allowUpgrades: false,
  pingTimeout: 60000,
  pingInterval: 25000
});

app.get('/', (req, res) => {
  res.send('Sinalização Digital Connect: ONLINE 🚀');
});

io.on('connection', (socket) => {
  console.log('✅ Canal de Dados Estabelecido:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', (data) => {
    socket.to(data.to).emit('signal', { 
      from: socket.id, 
      signal: data.signal 
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Dispositivo desconectado:', reason);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor industrial rodando na porta ${PORT}`);
});