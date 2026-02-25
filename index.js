const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('Digital Connect Signaling Server ON! 🚀');
});

io.on('connection', (socket) => {
  console.log('✅ Dispositivo ID:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Dispositivo ${socket.id} entrou na sala ${roomId}`);
    // Notifica os outros que alguém chegou para iniciar o WebRTC
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', (data) => {
    // Repassa o sinal SDP/IceCandidate para o outro dispositivo na sala
    socket.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
  });

  socket.on('disconnect', () => {
    console.log('❌ Dispositivo desconectado');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Sinalização rodando na porta ${PORT}`);
});