const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// 1. Liberação de CORS total no Express
app.use(cors()); 

const server = http.createServer(app);

// 2. Configuração do Socket.io para nuvem (Render)
const io = new Server(server, {
  cors: {
    origin: "*", // Libera para qualquer origem durante os testes
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true, // Compatibilidade com versões anteriores
  transports: ['websocket', 'polling'] 
});

app.get('/', (req, res) => {
  res.send('Digital Connect Signaling Server ON! 🚀');
});

io.on('connection', (socket) => {
  console.log('✅ Dispositivo Conectado:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Dispositivo ${socket.id} entrou na sala ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', (data) => {
    // Repassa o sinal WebRTC para o outro computador
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
  console.log(`Servidor rodando na porta ${PORT}`);
});