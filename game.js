const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

/* =========================================================
   CACTUC LUDO KING
   Multiplayer + Computer
========================================================= */

const SERVER_URL =
    "https://cactuc-ludo-serverbot.onrender.com";

let socket = null;

let playerId =
    localStorage.getItem("cactuc_player_id");

if (!playerId) {
    playerId =
        "p_" +
        Math.random()
            .toString(36)
            .substring(2, 12);

    localStorage.setItem(
        "cactuc_player_id",
        playerId
    );
}

let playerName =
    tg?.initDataUnsafe?.user?.first_name ||
    localStorage.getItem("cactuc_player_name") ||
    "Player";

localStorage.setItem(
    "cactuc_player_name",
    playerName
);

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {

    fa: {
        subtitle: "لودو چندنفره",
        create: "🏠 ساخت اتاق جدید",
        join: "🔑 ورود به اتاق",
        computer: "🤖 بازی با کامپیوتر",
        settings: "⚙️ تنظیمات",
        room: "🏠 اتاق بازی",
        roomCode: "کد اتاق",
        copy: "📋 کپی کد",
        start: "▶️ شروع بازی",
        joinRoom: "ورود",
        enterCode: "کد ۶ رقمی",
        back: "برگشت",
        roll: "تاس",
        rollHint: "تاس را بزن",
        waiting: "در انتظار بازیکنان...",
        choosePlayers: "تعداد بازیکنان",
        two: "۲ نفره",
        three: "۳ نفره",
        four: "۴ نفره",
        created: "اتاق ساخته شد",
        joined: "وارد اتاق شدی",
        copied: "کد کپی شد",
        roomFull: "اتاق پر است",
        notFound: "اتاق پیدا نشد",
        needPlayers: "حداقل دو بازیکن لازم است",
        notYourTurn: "نوبت شما نیست",
        computerStarted: "بازی با کامپیوتر شروع شد",
        turn: "نوبت"
    },

    en: {
        subtitle: "MULTIPLAYER LUDO",
        create: "🏠 CREATE ROOM",
        join: "🔑 JOIN ROOM",
        computer: "🤖 PLAY VS COMPUTER",
        settings: "⚙️ SETTINGS",
        room: "🏠 GAME ROOM",
        roomCode: "ROOM CODE",
        copy: "📋 COPY CODE",
        start: "▶️ START GAME",
        joinRoom: "JOIN",
        enterCode: "6 DIGIT CODE",
        back: "BACK",
        roll: "ROLL",
        rollHint: "ROLL THE DICE",
        waiting: "Waiting for players...",
        choosePlayers: "Number of players",
        two: "2 PLAYERS",
        three: "3 PLAYERS",
        four: "4 PLAYERS",
        created: "Room created",
        joined: "Joined room",
        copied: "Code copied",
        roomFull: "Room is full",
        notFound: "Room not found",
        needPlayers: "At least 2 players required",
        notYourTurn: "Not your turn",
        computerStarted: "Computer game started",
        turn: "TURN"
    },

    ar: {
        subtitle: "لودو متعددة اللاعبين",
        create: "🏠 إنشاء غرفة",
        join: "🔑 دخول إلى غرفة",
        computer: "🤖 اللعب ضد الكمبيوتر",
        settings: "⚙️ الإعدادات",
        room: "🏠 غرفة اللعب",
        roomCode: "رمز الغرفة",
        copy: "📋 نسخ الرمز",
        start: "▶️ بدء اللعبة",
        joinRoom: "دخول",
        enterCode: "رمز من 6 أرقام",
        back: "رجوع",
        roll: "النرد",
        rollHint: "ارمِ النرد",
        waiting: "في انتظار اللاعبين...",
        choosePlayers: "عدد اللاعبين",
        two: "لاعبان",
        three: "3 لاعبين",
        four: "4 لاعبين",
        created: "تم إنشاء الغرفة",
        joined: "تم الدخول",
        copied: "تم نسخ الرمز",
        roomFull: "الغرفة ممتلئة",
        notFound: "الغرفة غير موجودة",
        needPlayers: "مطلوب لاعبان على الأقل",
        notYourTurn: "ليس دورك",
        computerStarted: "بدأت اللعبة ضد الكمبيوتر",
        turn: "دور"
    },

    de: {
        subtitle: "MULTIPLAYER LUDO",
        create: "🏠 RAUM ERSTELLEN",
        join: "🔑 RAUM BEITRETEN",
        computer: "🤖 GEGEN COMPUTER",
        settings: "⚙️ EINSTELLUNGEN",
        room: "🏠 SPIELRAUM",
        roomCode: "RAUMCODE",
        copy: "📋 CODE KOPIEREN",
        start: "▶️ SPIEL STARTEN",
        joinRoom: "BEITRETEN",
        enterCode: "6-STELLIGER CODE",
        back: "ZURÜCK",
        roll: "WÜRFEL",
        rollHint: "WÜRFELN",
        waiting: "Warte auf Spieler...",
        choosePlayers: "Anzahl Spieler",
        two: "2 SPIELER",
        three: "3 SPIELER",
        four: "4 SPIELER",
        created: "Raum erstellt",
        joined: "Raum beigetreten",
        copied: "Code kopiert",
        roomFull: "Raum ist voll",
        notFound: "Raum nicht gefunden",
        needPlayers: "Mindestens 2 Spieler erforderlich",
        notYourTurn: "Du bist nicht dran",
        computerStarted: "Spiel gegen Computer gestartet",
        turn: "ZUG"
    },

    ru: {
        subtitle: "ЛУДО МУЛЬТИПЛЕЕР",
        create: "🏠 СОЗДАТЬ КОМНАТУ",
        join: "🔑 ВОЙТИ В КОМНАТУ",
        computer: "🤖 ИГРАТЬ С КОМПЬЮТЕРОМ",
        settings: "⚙️ НАСТРОЙКИ",
        room: "🏠 ИГРОВАЯ КОМНАТА",
        roomCode: "КОД КОМНАТЫ",
        copy: "📋 КОПИРОВАТЬ",
        start: "▶️ НАЧАТЬ ИГРУ",
        joinRoom: "ВОЙТИ",
        enterCode: "6-ЗНАЧНЫЙ КОД",
        back: "НАЗАД",
        roll: "КУБИК",
        rollHint: "БРОСИТЬ КУБИК",
        waiting: "Ожидание игроков...",
        choosePlayers: "Количество игроков",
        two: "2 ИГРОКА",
        three: "3 ИГРОКА",
        four: "4 ИГРОКА",
        created: "Комната создана",
        joined: "Вы вошли",
        copied: "Код скопирован",
        roomFull: "Комната заполнена",
        notFound: "Комната не найдена",
        needPlayers: "Нужно минимум 2 игрока",
        notYourTurn: "Сейчас не ваш ход",
        computerStarted: "Игра с компьютером началась",
        turn: "ХОД"
    }
};

let currentLanguage =
    localStorage.getItem("cactuc_language") ||
    "fa";

function t(key) {
    return (
        translations[currentLanguage]?.[key] ||
        translations.fa[key] ||
        key
    );
}

/* =========================================================
   ELEMENTS
========================================================= */

const menu =
    document.getElementById("menu");

const roomScreen =
    document.getElementById("roomScreen");

const joinScreen =
    document.getElementById("joinScreen");

const gameScreen =
    document.getElementById("gameScreen");

const settings =
    document.getElementById("settings");

/* =========================================================
   SCREEN
========================================================= */

function showScreen(screen) {

    [
        menu,
        roomScreen,
        joinScreen,
        gameScreen
    ].forEach(
        element =>
            element?.classList.add("hidden")
    );

    screen?.classList.remove("hidden");
}

/* =========================================================
   LANGUAGE
========================================================= */

function applyLanguage() {

    document.documentElement.lang =
        currentLanguage;

    document.documentElement.dir =
        currentLanguage === "fa" ||
        currentLanguage === "ar"
            ? "rtl"
            : "ltr";

    const setText = (
        id,
        key
    ) => {

        const el =
            document.getElementById(id);

        if (el) {
            el.textContent = t(key);
        }
    };

    setText("subtitle", "subtitle");
    setText("createRoomBtn", "create");
    setText("joinRoomBtn", "join");
    setText("computerBtn", "computer");
    setText("copyCodeBtn", "copy");
    setText("startBtn", "start");
    setText("joinBtn", "joinRoom");
    setText("backBtn", "back");

    const input =
        document.getElementById("roomInput");

    if (input) {
        input.placeholder =
            t("enterCode");
    }

    const dice =
        document.getElementById("diceBtn");

    if (dice?.lastElementChild) {
        dice.lastElementChild.textContent =
            t("roll");
    }
}

/* =========================================================
   ROOM STATE
========================================================= */

let currentRoom = null;

let selectedPlayers = 4;

let connected = false;

let localGameMode = false;

/* =========================================================
   PLAYER COUNT
========================================================= */

function choosePlayerCount() {

    const choice =
        prompt(
            `${t("choosePlayers")}\n\n` +
            `2 = ${t("two")}\n` +
            `3 = ${t("three")}\n` +
            `4 = ${t("four")}`
        );

    if (
        choice === "2" ||
        choice === "3" ||
        choice === "4"
    ) {

        selectedPlayers =
            Number(choice);

        createRoom();
    }
}

/* =========================================================
   CREATE ROOM
========================================================= */

async function createRoom() {

    try {

        const response =
            await fetch(
                `${SERVER_URL}/api/room/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        const data =
            await response.json();

        if (!data.ok) {
            throw new Error(
                "CREATE_FAILED"
            );
        }

        currentRoom =
            data.roomCode;

        document.getElementById(
            "roomCode"
        ).textContent =
            currentRoom;

        renderRoomPlayers([
            {
                id: playerId,
                name: playerName,
                color: "red"
            }
        ]);

        connectSocket();

        showScreen(roomScreen);

        message(t("created"));

    } catch (error) {

        console.error(error);

        message(
            "Server connection failed"
        );
    }
}

/* =========================================================
   ROOM PLAYERS
========================================================= */

function renderRoomPlayers(
    roomPlayers = []
) {

    const box =
        document.getElementById(
            "roomPlayers"
        );

    if (!box) return;

    box.innerHTML = "";

    const colors = [
        "🔴",
        "🟡",
        "🟢",
        "🔵"
    ];

    for (
        let i = 0;
        i < selectedPlayers;
        i++
    ) {

        const player =
            roomPlayers[i];

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "roomPlayer";

        if (player) {

            div.textContent =
                `${colors[i]} ${player.name}`;

        } else {

            div.textContent =
                `⏳ ${t("waiting")}`;
        }

        box.appendChild(div);
    }
}

/* =========================================================
   JOIN ROOM
========================================================= */

async function joinRoom() {

    const input =
        document.getElementById(
            "roomInput"
        );

    const code =
        input.value.trim();

    if (!/^\d{6}$/.test(code)) {

        message(
            currentLanguage === "fa"
                ? "کد باید ۶ رقمی باشد."
                : "Invalid room code."
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${SERVER_URL}/api/room/join`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        roomCode: code,
                        playerId,
                        playerName
                    })
                }
            );

        const data =
            await response.json();

        if (!data.ok) {

            message(
                data.error === "ROOM_FULL"
                    ? t("roomFull")
                    : t("notFound")
            );

            return;
        }

        currentRoom =
            code;

        selectedPlayers =
            data.room.players.length;

        renderRoomPlayers(
            data.room.players
        );

        connectSocket();

        showScreen(roomScreen);

        message(t("joined"));

    } catch (error) {

        console.error(error);

        message(
            "Server connection failed"
        );
    }
}

/* =========================================================
   WEBSOCKET
========================================================= */

function connectSocket() {

    if (!currentRoom) return;

    if (
        socket &&
        socket.readyState ===
            WebSocket.OPEN
    ) {
        joinSocketRoom();
        return;
    }

    const wsURL =
        SERVER_URL
            .replace(
                "https://",
                "wss://"
            )
            .replace(
                "http://",
                "ws://"
            );

    socket =
        new WebSocket(
            wsURL
        );

    socket.onopen = () => {

        connected = true;

        joinSocketRoom();
    };

    socket.onmessage = event => {

        let data;

        try {
            data =
                JSON.parse(
                    event.data
                );
        } catch {
            return;
        }

        handleServerMessage(
            data
        );
    };

    socket.onerror = error => {

        console.error(
            "WebSocket error",
            error
        );
    };

    socket.onclose = () => {

        connected = false;
    };
}

function joinSocketRoom() {

    if (
        !socket ||
        socket.readyState !==
            WebSocket.OPEN
    ) {
        return;
    }

    socket.send(
        JSON.stringify({
            type: "JOIN_ROOM",
            roomCode:
                currentRoom,
            playerId,
            playerName
        })
    );
}

/* =========================================================
   SERVER EVENTS
========================================================= */

function handleServerMessage(
    data
) {

    switch (data.type) {

        case "CONNECTED":

            if (
                data.room
            ) {

                selectedPlayers =
                    Math.max(
                        2,
                        data.room.players.length
                    );

                renderRoomPlayers(
                    data.room.players
                );
            }

            break;

        case "ROOM_UPDATED":

            if (
                data.room
            ) {

                renderRoomPlayers(
                    data.room.players
                );
            }

            break;

        case "GAME_STARTED":

            startLocalBoard();

            break;

        case "DICE_ROLLED":

            showDice(
                data.dice
            );

            break;

        case "TURN_CHANGED":

            updateTurn(
                data.currentPlayer
            );

            break;

        case "ERROR":

            message(
                translateError(
                    data.error
                )
            );

            break;
    }
}

/* =========================================================
   ERROR TRANSLATION
========================================================= */

function translateError(
    error
) {

    const errors = {

        ROOM_NOT_FOUND:
            t("notFound"),

        ROOM_FULL:
            t("roomFull"),

        NEED_AT_LEAST_2_PLAYERS:
            t("needPlayers"),

        NOT_YOUR_TURN:
            t("notYourTurn")
    };

    return (
        errors[error] ||
        error
    );
}

/* =========================================================
   START MULTIPLAYER GAME
========================================================= */

function startMultiplayerGame() {

    if (!currentRoom) {
        return;
    }

    if (!socket) {
        connectSocket();
    }

    if (
        socket &&
        socket.readyState ===
            WebSocket.OPEN
    ) {

        socket.send(
            JSON.stringify({
                type:
                    "START_GAME",
                roomCode:
                    currentRoom,
                playerId
            })
        );
    }
}

/* =========================================================
   COMPUTER GAME
========================================================= */

function startComputerGame() {

    localGameMode = true;

    selectedPlayers = 2;

    resetLocalGame();

    buildBoard();

    renderGame();

    showScreen(
        gameScreen
    );

    message(
        t("computerStarted")
    );

    setTimeout(
        computerTurn,
        1000
    );
}

/* =========================================================
   LUDO ENGINE
========================================================= */

const colors = [
    "red",
    "yellow",
    "green",
    "blue"
];

const playerNames = [
    "RED",
    "YELLOW",
    "GREEN",
    "BLUE"
];

const startPositions = [
    0,
    13,
    26,
    39
];

const path = [

    [6,1],
    [6,2],
    [6,3],
    [6,4],
    [6,5],

    [5,6],
    [4,6],
    [3,6],
    [2,6],
    [1,6],

    [0,6],
    [0,7],
    [0,8],

    [1,8],
    [2,8],
    [3,8],
    [4,8],
    [5,8],

    [6,9],
    [6,10],
    [6,11],
    [6,12],
    [6,13],
    [6,14],

    [7,14],
    [8,14],

    [8,13],
    [8,12],
    [8,11],
    [8,10],
    [8,9],

    [9,8],
    [10,8],
    [11,8],
    [12,8],
    [13,8],
    [14,8],

    [14,7],
    [14,6],

    [13,6],
    [12,6],
    [11,6],
    [10,6],
    [9,6],

    [8,5],
    [8,4],
    [8,3],
    [8,2],
    [8,1],
    [8,0],

    [7,0],
    [6,0]
];

const safeSquares =
    new Set([
        0,
        8,
        13,
        21,
        26,
        34,
        39,
        47
    ]);

let players = [];

let currentPlayer = 0;

let rolled = false;

let currentRoll = 0;

let gameStarted = false;

/* =========================================================
   RESET
========================================================= */

function resetLocalGame() {

    const activePlayers =
        localGameMode
            ? 2
            : selectedPlayers;

    players =
        colors
            .slice(
                0,
                activePlayers
            )
            .map(
                color => ({
                    color,
                    pieces: [
                        -1,
                        -1,
                        -1,
                        -1
                    ]
                })
            );

    currentPlayer = 0;

    rolled = false;

    currentRoll = 0;

    gameStarted = true;
}

/* =========================================================
   BOARD
========================================================= */

function buildBoard() {

    const board =
        document.getElementById(
            "board"
        );

    if (!board) return;

    board.innerHTML = "";

    for (
        let row = 0;
        row < 15;
        row++
    ) {

        for (
            let col = 0;
            col < 15;
            col++
        ) {

            const cell =
                document.createElement(
                    "div"
                );

            cell.className =
                "cell";

            if (
                row <= 5 &&
                col <= 5
            ) {
                cell.classList.add(
                    "baseRed"
                );
            }

            if (
                row <= 5 &&
                col >= 9
            ) {
                cell.classList.add(
                    "baseYellow"
                );
            }

            if (
                row >= 9 &&
                col <= 5
            ) {
                cell.classList.add(
                    "baseGreen"
                );
            }

            if (
                row >= 9 &&
                col >= 9
            ) {
                cell.classList.add(
                    "baseBlue"
                );
            }

            board.appendChild(
                cell
            );
        }
    }

    path.forEach(
        ([row, col], index) => {

            const cell =
                getCell(
                    row,
                    col
                );

            if (!cell) return;

            cell.className =
                "cell path";

            if (
                safeSquares.has(
                    index
                )
            ) {
                cell.classList.add(
                    "safe"
                );
            }
        }
    );

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        getCell(
            5 - i,
            7
        )?.classList.add(
            "laneRed"
        );

        getCell(
            7,
            9 + i
        )?.classList.add(
            "laneYellow"
        );

        getCell(
            9 + i,
            7
        )?.classList.add(
            "laneGreen"
        );

        getCell(
            7,
            5 - i
        )?.classList.add(
            "laneBlue"
        );
    }

    for (
        let row = 6;
        row <= 8;
        row++
    ) {

        for (
            let col = 6;
            col <= 8;
            col++
        ) {

            getCell(
                row,
                col
            )?.classList.add(
                "center"
            );
        }
    }
}

function getCell(
    row,
    col
) {

    const board =
        document.getElementById(
            "board"
        );

    if (!board) return null;

    return board.children[
        row * 15 + col
    ];
}

/* =========================================================
   POSITION
========================================================= */

function getPosition(
    playerIndex,
    pieceIndex
) {

    const distance =
        players[playerIndex]
            .pieces[pieceIndex];

    if (
        distance < 0 ||
        distance === 57
    ) {
        return null;
    }

    if (
        distance <= 51
    ) {

        const index =
            (
                startPositions[
                    playerIndex
                ] +
                distance
            ) % 52;

        return path[index];
    }

    const lane =
        distance - 52;

    if (
        playerIndex === 0
    ) {
        return [
            5 - lane,
            7
        ];
    }

    if (
        playerIndex === 1
    ) {
        return [
            7,
            9 + lane
        ];
    }

    if (
        playerIndex === 2
    ) {
        return [
            9 + lane,
            7
        ];
    }

    return [
        7,
        5 - lane
    ];
}

/* =========================================================
   MOVE RULE
========================================================= */

function canMove(
    playerIndex,
    pieceIndex,
    number
) {

    const value =
        players[playerIndex]
            .pieces[pieceIndex];

    if (
        value === 57
    ) {
        return false;
    }

    if (
        value === -1
    ) {
        return number === 6;
    }

    return (
        value + number <= 57
    );
}

/* =========================================================
   RENDER
========================================================= */

function renderGame() {

    document
        .querySelectorAll(
            ".piece"
        )
        .forEach(
            piece =>
                piece.remove()
        );

    players.forEach(
        (
            player,
            playerIndex
        ) => {

            player.pieces.forEach(
                (
                    value,
                    pieceIndex
                ) => {

                    const position =
                        getPosition(
                            playerIndex,
                            pieceIndex
                        );

                    if (!position) {
                        return;
                    }

                    const cell =
                        getCell(
                            position[0],
                            position[1]
                        );

                    if (!cell) {
                        return;
                    }

                    const piece =
                        document.createElement(
                            "button"
                        );

                    piece.className =
                        `piece ${player.color}`;

                    if (
                        playerIndex ===
                            currentPlayer &&
                        rolled &&
                        canMove(
                            playerIndex,
                            pieceIndex,
                            currentRoll
                        )
                    ) {

                        piece.classList.add(
                            "selectable"
                        );
                    }

                    piece.onclick =
                        () => {

                            movePiece(
                                playerIndex,
                                pieceIndex
                            );
                        };

                    cell.appendChild(
                        piece
                    );
                }
            );

            const finished =
                player.pieces.filter(
                    value =>
                        value === 57
                ).length;

            const cards =
                document.querySelectorAll(
                    `.player.${player.color}`
                );

            cards.forEach(
                card => {

                    const span =
                        card.querySelector(
                            "span"
                        );

                    if (span) {
                        span.textContent =
                            `${finished}/4`;
                    }
                }
            );
        }
    );

    updateTurn(
        currentPlayer
    );
}

/* =========================================================
   DICE
========================================================= */

function rollDice() {

    if (
        !gameStarted ||
        rolled
    ) {
        return;
    }

    if (
        localGameMode &&
        currentPlayer !== 0
    ) {
        return;
    }

    currentRoll =
        Math.floor(
            Math.random() * 6
        ) + 1;

    showDice(
        currentRoll
    );

    rolled = true;

    renderGame();

    const possible =
        players[currentPlayer]
            .pieces
            .some(
                (
                    _,
                    index
                ) =>
                    canMove(
                        currentPlayer,
                        index,
                        currentRoll
                    )
            );

    if (!possible) {

        rolled = false;

        message(
            currentLanguage === "fa"
                ? "حرکت ممکن نیست."
                : "No move available."
        );

        setTimeout(
            nextTurn,
            700
        );
    }
}

function showDice(
    number
) {

    const faces = [
        "⚀",
        "⚁",
        "⚂",
        "⚃",
        "⚄",
        "⚅"
    ];

    const dice =
        document.getElementById(
            "diceBtn"
        );

    if (!dice) return;

    dice.firstChild.textContent =
        faces[number - 1];
}

/* =========================================================
   MOVE PIECE
========================================================= */

function movePiece(
    playerIndex,
    pieceIndex
) {

    if (
        playerIndex !==
        currentPlayer
    ) {
        return;
    }

    if (!rolled) {
        return;
    }

    if (
        !canMove(
            playerIndex,
            pieceIndex,
            currentRoll
        )
    ) {
        return;
    }

    let value =
        players[playerIndex]
            .pieces[pieceIndex];

    if (
        value === -1
    ) {
        value = 0;
    } else {
        value += currentRoll;
    }

    players[playerIndex]
        .pieces[pieceIndex] =
        value;

    capture(
        playerIndex,
        pieceIndex
    );

    rolled = false;

    renderGame();

    if (
        players[playerIndex]
            .pieces
            .every(
                value =>
                    value === 57
            )
    ) {

        alert(
            `${playerNames[playerIndex]} 🏆`
        );

        return;
    }

    if (
        currentRoll === 6
    ) {

        message(
            currentLanguage === "fa"
                ? "۶ آمد! دوباره تاس بزن."
                : "SIX! Roll again."
        );

        return;
    }

    setTimeout(
        nextTurn,
        500
    );
}

/* =========================================================
   CAPTURE
========================================================= */

function capture(
    playerIndex,
    pieceIndex
) {

    const value =
        players[playerIndex]
            .pieces[pieceIndex];

    if (
        value < 0 ||
        value > 51
    ) {
        return;
    }

    const position =
        (
            startPositions[
                playerIndex
            ] +
            value
        ) % 52;

    if (
        safeSquares.has(
            position
        )
    ) {
        return;
    }

    players.forEach(
        (
            opponent,
            opponentIndex
        ) => {

            if (
                opponentIndex ===
                playerIndex
            ) {
                return;
            }

            opponent.pieces =
                opponent.pieces.map(
                    enemyValue => {

                        if (
                            enemyValue >= 0 &&
                            enemyValue <= 51
                        ) {

                            const enemyPosition =
                                (
                                    startPositions[
                                        opponentIndex
                                    ] +
                                    enemyValue
                                ) % 52;

                            if (
                                enemyPosition ===
                                position
                            ) {
                                return -1;
                            }
                        }

                        return enemyValue;
                    }
                );
        }
    );
}

/* =========================================================
   TURN
========================================================= */

function nextTurn() {

    currentPlayer =
        (
            currentPlayer + 1
        ) %
        players.length;

    rolled = false;

    renderGame();

    if (
        localGameMode &&
        currentPlayer !== 0
    ) {

        setTimeout(
            computerTurn,
            800
        );
    }
}

function updateTurn(
    playerIndex
) {

    const turn =
        document.getElementById(
            "turnText"
        );

    if (!turn) return;

    const name =
        playerNames[
            playerIndex
        ] || "PLAYER";

    if (
        currentLanguage === "fa"
    ) {

        turn.textContent =
            `${t("turn")} ${name}`;

    } else {

        turn.textContent =
            `${name}'S ${t("turn")}`;
    }
}

/* =========================================================
   COMPUTER AI
========================================================= */

function computerTurn() {

    if (
        !localGameMode ||
        currentPlayer === 0
    ) {
        return;
    }

    rollDice();

    setTimeout(
        () => {

            if (!rolled) {
                return;
            }

            const possible =
                players[currentPlayer]
                    .pieces
                    .map(
                        (
                            _,
                            index
                        ) => index
                    )
                    .filter(
                        index =>
                            canMove(
                                currentPlayer,
                                index,
                                currentRoll
                            )
                    );

            if (
                possible.length === 0
            ) {
                return;
            }

            let chosen =
                possible[0];

            for (
                const index
                of possible
            ) {

                const value =
                    players[
                        currentPlayer
                    ].pieces[index];

                const newValue =
                    value === -1
                        ? 0
                        : value +
                          currentRoll;

                if (
                    newValue === 57
                ) {

                    chosen =
                        index;

                    break;
                }
            }

            movePiece(
                currentPlayer,
                chosen
            );

        },
        600
    );
}

/* =========================================================
   START BOARD
========================================================= */

function startLocalBoard() {

    localGameMode = false;

    resetLocalGame();

    buildBoard();

    renderGame();

    showScreen(
        gameScreen
    );
}

/* =========================================================
   COPY CODE
========================================================= */

async function copyRoomCode() {

    if (!currentRoom) {
        return;
    }

    try {

        await navigator.clipboard.writeText(
            currentRoom
        );

    } catch {

        const input =
            document.createElement(
                "input"
            );

        input.value =
            currentRoom;

        document.body.appendChild(
            input
        );

        input.select();

        document.execCommand(
            "copy"
        );

        input.remove();
    }

    message(
        t("copied")
    );
}

/* =========================================================
   MESSAGE
========================================================= */

function message(
    text
) {

    const box =
        document.getElementById(
            "gameMessage"
        );

    if (box) {
        box.textContent =
            text;
    }
}

/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById(
        "createRoomBtn"
    )
    ?.addEventListener(
        "click",
        choosePlayerCount
    );

document
    .getElementById(
        "joinRoomBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            showScreen(
                joinScreen
            );
        }
    );

document
    .getElementById(
        "computerBtn"
    )
    ?.addEventListener(
        "click",
        startComputerGame
    );

document
    .getElementById(
        "copyCodeBtn"
    )
    ?.addEventListener(
        "click",
        copyRoomCode
    );

document
    .getElementById(
        "startBtn"
    )
    ?.addEventListener(
        "click",
        startMultiplayerGame
    );

document
    .getElementById(
        "joinBtn"
    )
    ?.addEventListener(
        "click",
        joinRoom
    );

document
    .getElementById(
        "backBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            showScreen(
                menu
            );
        }
    );

document
    .getElementById(
        "diceBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            if (
                localGameMode
            ) {

                rollDice();

                return;
            }

            if (
                socket &&
                socket.readyState ===
                    WebSocket.OPEN
            ) {

                socket.send(
                    JSON.stringify({
                        type:
                            "ROLL_DICE",
                        roomCode:
                            currentRoom,
                        playerId
                    })
                );
            }
        }
    );

/* =========================================================
   SETTINGS
========================================================= */

document
    .getElementById(
        "settingsBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            settings?.classList.remove(
                "hidden"
            );
        }
    );

document
    .getElementById(
        "closeSettings"
    )
    ?.addEventListener(
        "click",
        () => {

            settings?.classList.add(
                "hidden"
            );
        }
    );

document
    .querySelectorAll(
        "[data-lang]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentLanguage =
                        button.dataset.lang;

                    localStorage.setItem(
                        "cactuc_language",
                        currentLanguage
                    );

                    applyLanguage();

                    settings?.classList.add(
                        "hidden"
                    );
                }
            );
        }
    );

/* =========================================================
   START
========================================================= */

applyLanguage();
