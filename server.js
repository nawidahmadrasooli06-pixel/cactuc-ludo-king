const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);

app.use(express.json());

const PORT = process.env.PORT || 10000;

/* =========================
   LUDO SERVER
========================= */

const rooms = new Map();

function createRoomCode() {
    let code;

    do {
        code = Math.floor(
            100000 + Math.random() * 900000
        ).toString();
    } while (rooms.has(code));

    return code;
}

function createRoom() {
    const code = createRoomCode();

    const room = {
        code,
        players: [],
        started: false,
        currentPlayer: 0,
        createdAt: Date.now()
    };

    rooms.set(code, room);

    return room;
}

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
    res.json({
        ok: true,
        name: "CACTUC LUDO KING",
        server: "online",
        rooms: rooms.size
    });
});

/* =========================
   CREATE ROOM
========================= */

app.post("/api/room/create", (req, res) => {
    const room = createRoom();

    res.json({
        ok: true,
        roomCode: room.code
    });
});

/* =========================
   ROOM INFO
========================= */

app.get("/api/room/:code", (req, res) => {
    const code = req.params.code;
    const room = rooms.get(code);

    if (!room) {
        return res.status(404).json({
            ok: false,
            error: "ROOM_NOT_FOUND"
        });
    }

    res.json({
        ok: true,
        room: {
            code: room.code,
            players: room.players.map(player => ({
                id: player.id,
                name: player.name,
                color: player.color
            })),
            started: room.started,
            currentPlayer: room.currentPlayer
        }
    });
});

/* =========================
   JOIN ROOM
========================= */

app.post("/api/room/join", (req, res) => {
    const {
        roomCode,
        playerId,
        playerName
    } = req.body;

    if (!roomCode || !playerId) {
        return res.status(400).json({
            ok: false,
            error: "MISSING_DATA"
        });
    }

    const room = rooms.get(String(roomCode));

    if (!room) {
        return res.status(404).json({
            ok: false,
            error: "ROOM_NOT_FOUND"
        });
    }

    if (room.started) {
        return res.status(400).json({
            ok: false,
            error: "GAME_ALREADY_STARTED"
        });
    }

    if (room.players.length >= 4) {
        return res.status(400).json({
            ok: false,
            error: "ROOM_FULL"
        });
    }

    const alreadyJoined =
        room.players.find(
            player => player.id === playerId
        );

    if (alreadyJoined) {
        return res.json({
            ok: true,
            player: alreadyJoined,
            room
        });
    }

    const colors = [
        "red",
        "yellow",
        "green",
        "blue"
    ];

    const player = {
        id: String(playerId),
        name:
            playerName ||
            `Player ${room.players.length + 1}`,
        color: colors[room.players.length]
    };

    room.players.push(player);

    broadcastRoom(room);

    res.json({
        ok: true,
        player,
        room: {
            code: room.code,
            players: room.players
        }
    });
});

/* =========================
   START GAME
========================= */

app.post("/api/room/start", (req, res) => {
    const {
        roomCode,
        playerId
    } = req.body;

    const room = rooms.get(String(roomCode));

    if (!room) {
        return res.status(404).json({
            ok: false,
            error: "ROOM_NOT_FOUND"
        });
    }

    if (!room.players.some(p => p.id === String(playerId))) {
        return res.status(403).json({
            ok: false,
            error: "PLAYER_NOT_IN_ROOM"
        });
    }

    if (room.players.length < 2) {
        return res.status(400).json({
            ok: false,
            error: "NEED_AT_LEAST_2_PLAYERS"
        });
    }

    room.started = true;
    room.currentPlayer = 0;

    broadcast(room, {
        type: "GAME_STARTED",
        room: serializeRoom(room)
    });

    res.json({
        ok: true,
        room: serializeRoom(room)
    });
});

/* =========================
   WEBSOCKET
========================= */

const wss = new WebSocketServer({
    server
});

function broadcast(room, data) {
    const message = JSON.stringify(data);

    room.players.forEach(player => {
        if (
            player.socket &&
            player.socket.readyState === 1
        ) {
            player.socket.send(message);
        }
    });
}

function broadcastRoom(room) {
    broadcast(room, {
        type: "ROOM_UPDATED",
        room: serializeRoom(room)
    });
}

function serializeRoom(room) {
    return {
        code: room.code,
        started: room.started,
        currentPlayer: room.currentPlayer,
        players: room.players.map(player => ({
            id: player.id,
            name: player.name,
            color: player.color
        }))
    };
}

wss.on("connection", socket => {

    let connectedPlayer = null;
    let connectedRoom = null;

    socket.on("message", raw => {

        let data;

        try {
            data = JSON.parse(raw.toString());
        } catch {
            socket.send(
                JSON.stringify({
                    type: "ERROR",
                    error: "INVALID_JSON"
                })
            );

            return;
        }

        /* JOIN WEBSOCKET */

        if (data.type === "JOIN_ROOM") {

            const room = rooms.get(
                String(data.roomCode)
            );

            if (!room) {
                socket.send(
                    JSON.stringify({
                        type: "ERROR",
                        error: "ROOM_NOT_FOUND"
                    })
                );

                return;
            }

            const player = room.players.find(
                p => p.id === String(data.playerId)
            );

            if (!player) {
                socket.send(
                    JSON.stringify({
                        type: "ERROR",
                        error: "PLAYER_NOT_FOUND"
                    })
                );

                return;
            }

            player.socket = socket;

            connectedPlayer = player;
            connectedRoom = room;

            socket.send(
                JSON.stringify({
                    type: "CONNECTED",
                    room: serializeRoom(room),
                    player: {
                        id: player.id,
                        name: player.name,
                        color: player.color
                    }
                })
            );

            broadcastRoom(room);

            return;
        }

        /* DICE */

        if (data.type === "ROLL_DICE") {

            if (!connectedRoom || !connectedPlayer) {
                return;
            }

            const playerIndex =
                connectedRoom.players.findIndex(
                    p => p.id === connectedPlayer.id
                );

            if (
                playerIndex !==
                connectedRoom.currentPlayer
            ) {
                socket.send(
                    JSON.stringify({
                        type: "ERROR",
                        error: "NOT_YOUR_TURN"
                    })
                );

                return;
            }

            const dice =
                Math.floor(
                    Math.random() * 6
                ) + 1;

            broadcast(connectedRoom, {
                type: "DICE_ROLLED",
                playerId: connectedPlayer.id,
                dice
            });

            return;
        }

        /* TURN */

        if (data.type === "NEXT_TURN") {

            if (!connectedRoom) {
                return;
            }

            connectedRoom.currentPlayer =
                (
                    connectedRoom.currentPlayer + 1
                ) %
                connectedRoom.players.length;

            broadcast(connectedRoom, {
                type: "TURN_CHANGED",
                currentPlayer:
                    connectedRoom.currentPlayer
            });

            return;
        }

    });

    socket.on("close", () => {

        if (
            connectedRoom &&
            connectedPlayer
        ) {
            connectedPlayer.socket = null;

            broadcastRoom(
                connectedRoom
            );
        }

    });

});

/* =========================
   CLEAN EMPTY ROOMS
========================= */

setInterval(() => {

    const now = Date.now();

    for (
        const [code, room]
        of rooms.entries()
    ) {

        if (
            room.players.length === 0 &&
            now - room.createdAt >
            30 * 60 * 1000
        ) {
            rooms.delete(code);
        }
    }

}, 5 * 60 * 1000);

/* =========================
   START SERVER
========================= */

server.listen(PORT, () => {

    console.log(
        `CACTUC LUDO KING server running on port ${PORT}`
    );

});
