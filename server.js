const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const TelegramBot = require("node-telegram-bot-api");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const rooms = new Map();
app.get("/", (req, res) => {
  res.json({
    ok: true,
    name: "CACTUC LUDO KING",
    server: "online",
    rooms: rooms.size
  });
});
function makeCode() {
  let code;
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (rooms.has(code));
  return code;
}
function createRoom(host, maxPlayers) {
  const code = makeCode();
  const room = {
    code,
    maxPlayers,
    players: [],
    started: false,
    turn: 0
  };
  room.players.push(host);
  rooms.set(code, room);
  return room;
}
io.on("connection", socket => {
  socket.on("createRoom", ({ name, maxPlayers }) => {
    maxPlayers = Math.min(4, Math.max(2, Number(maxPlayers) || 2));
    const room = createRoom({
      id: socket.id,
      name: name || "Player",
      color: "red"
    }, maxPlayers);
    socket.join(room.code);
    socket.emit("roomCreated", {
      code: room.code,
      players: room.players,
      maxPlayers: room.maxPlayers
    });
  });
  socket.on("joinRoom", ({ code, name }) => {
    const room = rooms.get(String(code));
    if (!room) {
      socket.emit("roomError", "اتاق پیدا نشد.");
      return;
    }
    if (room.started) {
      socket.emit("roomError", "بازی شروع شده است.");
      return;
    }
    if (room.players.length >= room.maxPlayers) {
      socket.emit("roomError", "ظرفیت اتاق پر است.");
      return;
    }
    const colors = ["red", "yellow", "green", "blue"];
    room.players.push({
      id: socket.id,
      name: name || "Player",
      color: colors[room.players.length]
    });
    socket.join(room.code);
    io.to(room.code).emit("roomUpdate", {
      players: room.players,
      maxPlayers: room.maxPlayers
    });
  });
  socket.on("startRoom", code => {
    const room = rooms.get(String(code));
    if (!room) return;
    if (room.players.length < 2) {
      socket.emit("roomError", "حداقل دو بازیکن لازم است.");
      return;
    }
    room.started = true;
    room.turn = 0;
    io.to(room.code).emit("gameStarted", {
      players: room.players,
      turn: room.turn
    });
  });
  socket.on("disconnect", () => {
    for (const [code, room] of rooms) {
      const oldLength = room.players.length;
      room.players = room.players.filter(
        p => p.id !== socket.id
      );
      if (room.players.length !== oldLength) {
        io.to(code).emit("roomUpdate", {
          players: room.players,
          maxPlayers: room.maxPlayers
        });
      }
      if (room.players.length === 0) {
        rooms.delete(code);
      }
    }
  });
});
if (BOT_TOKEN) {
  const bot = new TelegramBot(BOT_TOKEN, { polling: true });
  bot.onText(/\/start/, async msg => {
    const chatId = msg.chat.id;
    await bot.sendMessage(
      chatId,
      `🌵👑 خوش آمدی به CACTUC LUDO KING 👑🌵
آماده‌ای برای یک بازی لودو هیجان‌انگیز؟
از منوی پایین روی «🎮 بازی کردن لدو» بزن و وارد بازی شو.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎮 بازی کردن لدو",
                web_app: {
                  url: "https://nawidahmadrasooli06-pixel.github.io/cactuc-ludo-king/"
                }
              }
            ],
            [
              {
                text: "📢 کانال من",
                url: "https://t.me/YOUR_CHANNEL"
              }
            ]
          ]
        }
      }
    );
  });
  console.log("Telegram bot is running.");
} else {
  console.log("BOT_TOKEN is not set.");
}
server.listen(PORT, () => {
  console.log(`CACTUC LUDO KING server running on ${PORT}`);
});
