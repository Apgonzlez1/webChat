const socket = io();

const sendBtn = document.querySelector("#send-message");
const messageInput = document.querySelector("#message");
const allMessages = document.querySelector("#all-messages");
const userList = document.querySelector("#users");

const getUsernameFromCookie = () => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("username="));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};

const currentUser = getUsernameFromCookie();
const connectedUsers = new Set();

// Escuchar lista de usuarios desde el servidor
socket.on("update-user-list", (users) => {
  connectedUsers.clear();
  users.forEach(user => connectedUsers.add(user));
  updateUserListUI();
  updateUserStatusIndicators();
});

// Al iniciar, agregamos al usuario actual
if (currentUser) {
  connectedUsers.add(currentUser);
  updateUserStatusIndicators();
  updateUserListUI();
}

// Enviar mensaje
function sendMessage() {
  const message = messageInput.value.trim();
  if (message !== "") {
    socket.emit("message", message);
    messageInput.value = "";
  }
}

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Mostrar mensajes
socket.on("message", ({ user, message }) => {
  const isCurrentUser = user === currentUser;
  const messageClass = isCurrentUser ? "user" : "other";
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

// Eventos individuales
socket.on("user-connected", (username) => {
  connectedUsers.add(username);
  updateUserListUI();
  updateUserStatusIndicators();
});

socket.on("user-disconnected", (username) => {
  connectedUsers.delete(username);
  updateUserListUI();
  updateUserStatusIndicators();
});

// Actualiza los puntitos en mensajes
function updateUserStatusIndicators() {
  document.querySelectorAll(".message .username").forEach((el) => {
    el.querySelectorAll(".status-dot").forEach(dot => dot.remove());

    const usernameOnly = el.textContent.trim().split(" ")[0];
    const isOnline = connectedUsers.has(usernameOnly);
    const dot = document.createElement("span");
    dot.classList.add("status-dot", isOnline ? "online" : "offline");
    el.appendChild(dot);
  });
}

// Lista lateral de usuarios
function updateUserListUI() {
  userList.innerHTML = "";
  const sorted = Array.from(connectedUsers).sort();
  sorted.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user;
    li.classList.add("online");
    userList.appendChild(li);
  });
}

// Emoji Picker
function toggleEmojiPicker() {
  const picker = document.getElementById("emojiPicker");
  picker.style.display = picker.style.display === "flex" ? "none" : "flex";
}

function addEmoji(emoji) {
  messageInput.value += emoji;
  messageInput.focus();
}

document.addEventListener("click", (event) => {
  const picker = document.getElementById("emojiPicker");
  const emojiBtn = document.querySelector(".emoji-btn");

  if (!picker.contains(event.target) && event.target !== emojiBtn) {
    picker.style.display = "none";
  }
});
