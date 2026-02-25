const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Liberação total para o tráfego HTTP básico

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Libera para qualquer site (HostGator, J7, PC)
    methods: ["GET", "POST"],
    credentials: true
  },
  // Permite que o sistema negocie o melhor protocolo automaticamente
  transports: ['polling', 'websocket'], 
  allowEIO3: true,
  pingTimeout: 60000, // Espera 1 minuto antes de desconectar
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
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', (data) => {
    socket.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Dispositivo desconectado:', reason);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});