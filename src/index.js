const express = require('express');
const { createServer } = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const httpServer = createServer(app);

// Socket.IO (chat en tiempo real)
const realTimeServer = require('./realTimeServer');

// Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas principales
app.use(require('./routes'));

// Iniciar servidor HTTP
httpServer.listen(app.get('port'), () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${app.get('port')}`);
});

// Iniciar Socket.IO
realTimeServer(httpServer);
