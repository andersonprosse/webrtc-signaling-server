const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Liberação para tráfego HTTP básico

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Liberação total para evitar conflitos com a HostGator
    methods: ["GET", "POST"],
    credentials: true
  },
  // PRIORIDADE TOTAL PARA WEBSOCKET (Evita o Erro 426)
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

app.get('/', (req, res) => {
  res.send('Digital Connect Signaling Server ON! 🚀');
});

io.on('connection', (socket) => {
  console.log('✅ Dispositivo Conectado:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Dispositivo ${socket.id} entrou na sala ${roomId}`);
    // Notifica os outros para iniciar o aperto de mão WebRTC
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', (data) => {
    // Repassa os metadados de vídeo (SDP/Candidates)
    socket.to(data.to).emit('signal', { 
      from: socket.id, 
      signal: data.signal 
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Desconectado:', reason);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});