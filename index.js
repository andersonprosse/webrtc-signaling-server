const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configuração de CORS: essencial para o site na HostGator conversar com o Render
const io = new Server(server, {
  cors: {
    origin: "*", // Permite acesso de qualquer lugar (ideal para seus testes no SENAI)
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('Servidor de Sinalização Industrial ON! 🚀');
});

io.on('connection', (socket) => {
  console.log('✅ Dispositivo conectado:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', (data) => {
    socket.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
  });

  socket.on('disconnect', () => console.log('❌ Dispositivo desconectado'));
});

// AJUSTE PARA O RENDER: Ele escolhe a porta sozinho
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});