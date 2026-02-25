const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Importação importante

const app = express();
app.use(cors()); // Libera o Express para receber requisições externashbk

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
  transports: ['polling', 'websocket'], // Garante que ele tente as duas formas
  allowEIO3: true // Compatibilidade extra
});

app.get('/', (req, res) => {
  res.send('Digital Connect Signaling Server ON! 🚀');
});

io.on('connection', (socket) => {
  console.log('✅ Dispositivo Conectado:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Dispositivo ${socket.id} entrou na sala: ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', (data) => {
    // Repassa o sinal para o destinatário específico
    socket.to(data.to).emit('signal', { 
      from: socket.id, 
      signal: data.signal 
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Dispositivo desconectado');
  });
});

// Porta dinâmica para o Render
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});