const express = require('express');
const { createServer } = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const httpServer = createServer(app);

// Importa la función que inicializa Socket.IO y la lógica del chat
const realTimeServer = require('./realTimeServer');

// Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());

// Middleware para servir archivos estáticos (css, js, img, etc)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use(require('./routes'));

// Middleware para pasar username a Socket.IO vía handshake (opcional, para que socket.io sepa quién es el usuario)
app.use((req, res, next) => {
  const username = req.cookies.username;
  req.username = username || null;
  next();
});

// Iniciar servidor HTTP
httpServer.listen(app.get('port'), () => {
  console.log(`Servidor corriendo en http://localhost:${app.get('port')}`);
});

// Inicializa el servidor en tiempo real (Socket.IO)
realTimeServer(httpServer);