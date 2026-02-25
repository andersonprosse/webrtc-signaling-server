const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); 

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    credentials: true
  },
  // TRAVA DEFINITIVA: Só aceita WebSocket (Mata Erro 426 e XHR Poll)
  transports: ['websocket'], 
  allowUpgrades: false,
  pingTimeout: 60000,
  pingInterval: 25000
});

app.get('/', (req, res) => {
  res.send('Digital Connect Signaling Server: ONLINE 🚀');
});

io.on('connection', (socket) => {
  console.log('✅ Dispositivo em Linha:', socket.id);

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

  socket.on('disconnect', () => console.log('❌ Dispositivo desconectado'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});