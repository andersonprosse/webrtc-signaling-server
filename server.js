const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Liberação total de headers HTTP

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Aceita qualquer origem (HostGator, Codespaces, etc)
    methods: ["GET", "POST"],
    credentials: true
  },
  // FORÇAR WEBSOCKET NO SERVIDOR
  transports: ['websocket'], 
  allowUpgrades: false
});

app.get('/', (req, res) => {
  res.send('Digital Connect Signaling Server ON! 🚀');
});

io.on('connection', (socket) => {
  console.log('✅ Conexão Direta Estabelecida:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', (data) => {
    socket.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
  });

  socket.on('disconnect', () => console.log('❌ Desconectado'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});