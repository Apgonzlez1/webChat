const socket = io();

const send = document.querySelector("#send-message");
const allMessages = document.querySelector("#all-messages");
const messageInput = document.querySelector("#message");

const getUsernameFromCookie = () => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("username="));
  return cookie ? cookie.split("=")[1] : null;
};

const currentUser = getUsernameFromCookie();

const connectedUsers = new Set();

// Al iniciar, asumimos que el usuario actual está conectado (mejorar esto con el servidor)
if (currentUser) {
  connectedUsers.add(currentUser);
  updateUserStatusIndicators();
}

// ESCUCHAR eventos desde servidor
socket.on("user-connected", (username) => {
  connectedUsers.add(username);
  updateUserStatusIndicators();
});

socket.on("user-disconnected", (username) => {
  connectedUsers.delete(username);
  updateUserStatusIndicators();
});

function sendMessage() {
  if (messageInput.value.trim() !== "") {
    socket.emit("message", messageInput.value);
    messageInput.value = "";
  }
}

send.addEventListener("click", () => {
  sendMessage();
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

socket.on("message", ({ user, message }) => {
  const isCurrentUser = user === currentUser;
  const messageClass = isCurrentUser ? "user" : "other";

  // Estado online si está en el set connectedUsers
  const isOnline = connectedUsers.has(user);
  const statusDot = `<span class="status-dot ${isOnline ? "online" : "offline"}"></span>`;

  const msg = document.createRange().createContextualFragment(`
    <div class="message ${messageClass}">
      <div class="image-container">
        <img src="/img/perfil.jpg" />
      </div>
      <div class="message-body">
        <div class="user-info">
          <span class="username">${user} ${statusDot}</span>
          <span class="time">Hace 1 minuto</span>
        </div>
        <p>${message}</p>
      </div>
    </div>
  `);

  allMessages.append(msg);
  allMessages.scrollTop = allMessages.scrollHeight;
});

function updateUserStatusIndicators() {
  document.querySelectorAll(".message .username").forEach((el) => {
    // Eliminar círculos viejos
    el.querySelectorAll(".status-dot").forEach(dot => dot.remove());

    // Extraer sólo el nombre (sin estado)
    const usernameOnly = el.textContent.trim().split(" ")[0];
    const isOnline = connectedUsers.has(usernameOnly);
    
    const statusDot = document.createElement("span");
    statusDot.classList.add("status-dot");
    statusDot.classList.add(isOnline ? "online" : "offline");
    el.appendChild(statusDot);
  });
}
function toggleEmojiPicker() {
  const picker = document.getElementById("emojiPicker");
  picker.style.display = (picker.style.display === "flex") ? "none" : "flex";
}

function addEmoji(emoji) {
  const input = document.getElementById("message");
  input.value += emoji;
  input.focus();
}

document.addEventListener("click", function (event) {
  const picker = document.getElementById("emojiPicker");
  const emojiBtn = document.querySelector(".emoji-btn");

  if (!picker.contains(event.target) && event.target !== emojiBtn) {
    picker.style.display = "none";
  }
});
