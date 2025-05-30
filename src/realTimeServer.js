const { Server } = require("socket.io");

module.exports = (httpServer) => {
  const io = new Server(httpServer);
  const connectedUsers = new Set();

  io.on("connection", (socket) => {
    const cookieHeader = socket.handshake.headers.cookie || "";
    const username = getUsernameFromCookie(cookieHeader);

    if (!username) {
      console.warn("Usuario no identificado, conexión rechazada.");
      return;
    }

    // Agregar usuario
    connectedUsers.add(username);
    console.log(`✅ ${username} se ha conectado`);

    // Notificar a otros que se conectó
    socket.broadcast.emit("user-connected", username);

    // Enviar la lista actualizada de usuarios conectados a todos
    io.emit("update-user-list", Array.from(connectedUsers));

    // Manejar recepción de mensajes
    socket.on("message", (message) => {
      io.emit("message", {
        user: username,
        message: message,
      });
    });

    // Manejar desconexión
    socket.on("disconnect", () => {
      connectedUsers.delete(username);
      console.log(`❌ ${username} se ha desconectado`);

      socket.broadcast.emit("user-disconnected", username);
      io.emit("update-user-list", Array.from(connectedUsers));
    });
  });

  // 🔧 Extrae el username de las cookies
  function getUsernameFromCookie(cookieString) {
    const cookies = cookieString.split(";").map(c => c.trim());
    const usernameCookie = cookies.find(c => c.startsWith("username="));
    return usernameCookie ? decodeURIComponent(usernameCookie.split("=")[1]) : null;
  }
};
