const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}
/* =========================
   LANGUAGE SYSTEM
========================= */
const translations = {
    fa: {
        subtitle: "بازی لودو",
        create: "🏠 ساخت اتاق جدید",
        join: "🔑 ورود به اتاق",
        computer: "🤖 بازی با کامپیوتر",
        settings: "⚙️ تنظیمات",
        room: "🏠 اتاق بازی",
        roomCode: "کد اتاق",
        copy: "📋 کپی کد",
        start: "▶️ شروع بازی",
        joinRoom: "ورود به اتاق",
        enterCode: "کد ۶ رقمی",
        back: "برگشت",
        roll: "تاس",
        redTurn: "نوبت قرمز",
        rollHint: "تاس را بزن",
        copied: "کد کپی شد!",
        invalid: "کد اتاق باید ۶ رقمی باشد.",
        newRoom: "اتاق جدید ساخته شد.",
        joined: "وارد اتاق شدی.",
        computerGame: "بازی با کامپیوتر شروع شد."
    },
    en: {
        subtitle: "LUDO GAME",
        create: "🏠 CREATE ROOM",
        join: "🔑 JOIN ROOM",
        computer: "🤖 PLAY VS COMPUTER",
        settings: "⚙️ SETTINGS",
        room: "🏠 GAME ROOM",
        roomCode: "ROOM CODE",
        copy: "📋 COPY CODE",
        start: "▶️ START GAME",
        joinRoom: "JOIN ROOM",
        enterCode: "6 DIGIT CODE",
        back: "BACK",
        roll: "ROLL",
        redTurn: "RED'S TURN",
        rollHint: "ROLL THE DICE",
        copied: "Code copied!",
        invalid: "Room code must contain 6 digits.",
        newRoom: "New room created.",
        joined: "You joined the room.",
        computerGame: "Computer game started."
    },
    ar: {
        subtitle: "لعبة لودو",
        create: "🏠 إنشاء غرفة جديدة",
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
        redTurn: "دور الأحمر",
        rollHint: "ارمِ النرد",
        copied: "تم نسخ الرمز!",
        invalid: "يجب أن يتكون الرمز من 6 أرقام.",
        newRoom: "تم إنشاء غرفة جديدة.",
        joined: "لقد دخلت الغرفة.",
        computerGame: "بدأت اللعبة ضد الكمبيوتر."
    },
    de: {
        subtitle: "LUDO SPIEL",
        create: "🏠 NEUEN RAUM ERSTELLEN",
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
        redTurn: "ROT IST DRAN",
        rollHint: "WÜRFELN",
        copied: "Code kopiert!",
        invalid: "Der Raumcode muss 6 Ziffern haben.",
        newRoom: "Neuer Raum erstellt.",
        joined: "Du bist dem Raum beigetreten.",
        computerGame: "Spiel gegen Computer gestartet."
    },
    ru: {
        subtitle: "ИГРА ЛУДО",
        create: "🏠 СОЗДАТЬ КОМНАТУ",
        join: "🔑 ВОЙТИ В КОМНАТУ",
        computer: "🤖 ИГРАТЬ С КОМПЬЮТЕРОМ",
        settings: "⚙️ НАСТРОЙКИ",
        room: "🏠 ИГРОВАЯ КОМНАТА",
        roomCode: "КОД КОМНАТЫ",
        copy: "📋 КОПИРОВАТЬ КОД",
        start: "▶️ НАЧАТЬ ИГРУ",
        joinRoom: "ВОЙТИ",
        enterCode: "6-ЗНАЧНЫЙ КОД",
        back: "НАЗАД",
        roll: "КУБИК",
        redTurn: "ХОД КРАСНОГО",
        rollHint: "БРОСЬТЕ КУБИК",
        copied: "Код скопирован!",
        invalid: "Код должен содержать 6 цифр.",
        newRoom: "Новая комната создана.",
        joined: "Вы вошли в комнату.",
        computerGame: "Игра с компьютером началась."
    }
};
/* =========================
   LANGUAGE
========================= */
let currentLanguage =
    localStorage.getItem("cactuc_language") || "fa";
function t(key) {
    return translations[currentLanguage][key]
        || translations.fa[key]
        || key;
}
function applyLanguage() {
    document.documentElement.lang =
        currentLanguage;
    document.documentElement.dir =
        currentLanguage === "fa" ||
        currentLanguage === "ar"
            ? "rtl"
            : "ltr";
    document.getElementById(
        "subtitle"
    ).textContent =
        t("subtitle");
    document.getElementById(
        "createRoomBtn"
    ).textContent =
        t("create");
    document.getElementById(
        "joinRoomBtn"
    ).textContent =
        t("join");
    document.getElementById(
        "computerBtn"
    ).textContent =
        t("computer");
    document.getElementById(
        "settingsBtn"
    ).title =
        t("settings");
    document.getElementById(
        "copyCodeBtn"
    ).textContent =
        t("copy");
    document.getElementById(
        "startBtn"
    ).textContent =
        t("start");
    document.getElementById(
        "joinBtn"
    ).textContent =
        t("joinRoom");
    document.getElementById(
        "roomInput"
    ).placeholder =
        t("enterCode");
    document.getElementById(
        "backBtn"
    ).textContent =
        t("back");
    document.getElementById(
        "diceBtn"
    ).lastElementChild.textContent =
        t("roll");
    document.getElementById(
        "gameMessage"
    ).textContent =
        t("rollHint");
    document.querySelector(
        "#roomScreen h2"
    ).textContent =
        t("room");
    document.querySelector(
        ".roomCode small"
    ).textContent =
        t("roomCode");
}
/* =========================
   SCREEN CONTROL
========================= */
const menu =
    document.getElementById("menu");
const roomScreen =
    document.getElementById("roomScreen");
const joinScreen =
    document.getElementById("joinScreen");
const gameScreen =
    document.getElementById("gameScreen");
function showScreen(screen) {
    menu.classList.add("hidden");
    roomScreen.classList.add("hidden");
    joinScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    screen.classList.remove("hidden");
}
/* =========================
   ROOM SYSTEM
========================= */
let currentRoom = null;
function createRoomCode() {
    return Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();
}
function createRoom() {
    currentRoom =
        createRoomCode();
    document.getElementById(
        "roomCode"
    ).textContent =
        currentRoom;
    document.getElementById(
        "roomPlayers"
    ).innerHTML = `
        <div class="roomPlayer">
            🔴 ${getPlayerName()}
        </div>
        <div class="roomPlayer">
            ⏳ Waiting for player...
        </div>
        <div class="roomPlayer">
            ⏳ Waiting for player...
        </div>
        <div class="roomPlayer">
            ⏳ Waiting for player...
        </div>
    `;
    message(t("newRoom"));
    showScreen(roomScreen);
}
function joinRoom() {
    const input =
        document.getElementById(
            "roomInput"
        );
    const code =
        input.value.trim();
    if (
        !/^\d{6}$/.test(code)
    ) {
        message(t("invalid"));
        return;
    }
    currentRoom = code;
    message(t("joined"));
    startLocalGame();
}
/* =========================
   PLAYER NAME
========================= */
function getPlayerName() {
    if (
        tg &&
        tg.initDataUnsafe &&
        tg.initDataUnsafe.user
    ) {
        return (
            tg.initDataUnsafe.user.first_name
            || "Player"
        );
    }
    return "Player";
}
/* =========================
   COPY ROOM CODE
========================= */
async function copyRoomCode() {
    if (!currentRoom) {
        return;
    }
    try {
        await navigator.clipboard.writeText(
            currentRoom
        );
    } catch {
        const temp =
            document.createElement("input");
        temp.value =
            currentRoom;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
    }
    message(t("copied"));
}
/* =========================
   LUDO ENGINE
========================= */
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
function resetGame() {
    players =
        colors.map(color => ({
            color,
            pieces: [
                -1,
                -1,
                -1,
                -1
            ]
        }));
    currentPlayer = 0;
    rolled = false;
    currentRoll = 0;
    gameStarted = true;
}
function buildBoard() {
    const board =
        document.getElementById("board");
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
                document.createElement("div");
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
            board.appendChild(cell);
        }
    }
    path.forEach(
        ([row, col], index) => {
            const cell =
                getCell(row, col);
            cell.className =
                "cell path";
            if (
                safeSquares.has(index)
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
        ).classList.add(
            "laneRed"
        );
        getCell(
            7,
            9 + i
        ).classList.add(
            "laneYellow"
        );
        getCell(
            9 + i,
            7
        ).classList.add(
            "laneGreen"
        );
        getCell(
            7,
            5 - i
        ).classList.add(
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
            ).classList.add(
                "center"
            );
        }
    }
}
function getCell(
    row,
    col
) {
    return document.getElementById(
        "board"
    ).children[
        row * 15 + col
    ];
}
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
                ]
                +
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
/* =========================
   RENDER PIECES
========================= */
function renderGame() {
    document
        .querySelectorAll(".piece")
        .forEach(
            piece =>
                piece.remove()
        );
    players.forEach(
        (player, playerIndex) => {
            player.pieces.forEach(
                (value, pieceIndex) => {
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
                    x => x === 57
                ).length;
            const card =
                document.querySelector(
                    `.${player.color}`
                );
            if (card) {
                const span =
                    card.querySelector(
                        "span"
                    );
                if (span) {
                    span.textContent =
                        `${finished}/4`;
                }
            }
        }
    );
    const turnText =
        document.getElementById(
            "turnText"
        );
    turnText.textContent =
        currentLanguage === "fa"
            ? `نوبت ${playerNames[currentPlayer]}`
            : `${playerNames[currentPlayer]}'S TURN`;
}
/* =========================
   DICE
========================= */
document
    .getElementById("diceBtn")
    .addEventListener(
        "click",
        rollDice
    );
function rollDice() {
    if (
        !gameStarted ||
        rolled
    ) {
        return;
    }
    currentRoll =
        Math.floor(
            Math.random() * 6
        ) + 1;
    const faces = [
        "⚀",
        "⚁",
        "⚂",
        "⚃",
        "⚄",
        "⚅"
    ];
    document.getElementById(
        "diceBtn"
    ).firstChild.textContent =
        faces[currentRoll - 1];
    rolled = true;
    renderGame();
    const possible =
        players[currentPlayer]
            .pieces
            .some(
                (_, index) =>
                    canMove(
                        currentPlayer,
                        index,
                        currentRoll
                    )
            );
    if (!possible) {
        rolled = false;
        document.getElementById(
            "gameMessage"
        ).textContent =
            currentRoll === 6
                ? "No move available."
                : "No move available.";
        setTimeout(
            nextTurn,
            700
        );
    }
}
/* =========================
   MOVE
========================= */
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
                x => x === 57
            )
    ) {
        alert(
            `${playerNames[playerIndex]} WINS! 🏆`
        );
        return;
    }
    if (
        currentRoll === 6
    ) {
        document.getElementById(
            "gameMessage"
        ).textContent =
            "SIX! Roll again.";
        return;
    }
    setTimeout(
        nextTurn,
        500
    );
}
/* =========================
   CAPTURE
========================= */
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
            startPositions[playerIndex]
            +
            value
        ) % 52;
    if (
        safeSquares.has(position)
    ) {
        return;
    }
    players.forEach(
        (opponent, opponentIndex) => {
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
                                    ]
                                    +
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
/* =========================
   TURN
========================= */
function nextTurn() {
    currentPlayer =
        (
            currentPlayer + 1
        ) % 4;
    renderGame();
    /*
        Simple local AI
    */
    if (
        currentPlayer !== 0
    ) {
        setTimeout(
            () => {
                rollDice();
                setTimeout(
                    botChoosePiece,
                    500
                );
            },
            600
        );
    }
}
function botChoosePiece() {
    if (!rolled) {
        return;
    }
    const possible =
        players[currentPlayer]
            .pieces
            .map(
                (_, index) =>
                    index
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
    /*
        Prefer HOME move.
    */
    for (
        const index of possible
    ) {
        const value =
            players[currentPlayer]
                .pieces[index];
        const newValue =
            value === -1
                ? 0
                : value + currentRoll;
        if (
            newValue === 57
        ) {
            chosen = index;
            break;
        }
    }
    movePiece(
        currentPlayer,
        chosen
    );
}
/* =========================
   LOCAL COMPUTER GAME
========================= */
function startLocalGame() {
    resetGame();
    buildBoard();
    renderGame();
    showScreen(gameScreen);
}
/* =========================
   BUTTONS
========================= */
document
    .getElementById(
        "createRoomBtn"
    )
    .onclick =
        createRoom;
document
    .getElementById(
        "joinRoomBtn"
    )
    .onclick =
        () => {
            showScreen(
                joinScreen
            );
        };
document
    .getElementById(
        "computerBtn"
    )
    .onclick =
        () => {
            message(
                t("computerGame")
            );
            startLocalGame();
        };
document
    .getElementById(
        "copyCodeBtn"
    )
    .onclick =
        copyRoomCode;
document
    .getElementById(
        "startBtn"
    )
    .onclick =
        startLocalGame;
document
    .getElementById(
        "joinBtn"
    )
    .onclick =
        joinRoom;
document
    .getElementById(
        "backBtn"
    )
    .onclick =
        () => {
            showScreen(menu);
        };
/* =========================
   SETTINGS
========================= */
document
    .getElementById(
        "settingsBtn"
    )
    .onclick =
        () => {
            document
                .getElementById(
                    "settings"
                )
                .classList
                .remove("hidden");
        };
document
    .getElementById(
        "closeSettings"
    )
    .onclick =
        () => {
            document
                .getElementById(
                    "settings"
                )
                .classList
                .add("hidden");
        };
document
    .querySelectorAll(
        "[data-lang]"
    )
    .forEach(
        button => {
            button.onclick =
                () => {
                    currentLanguage =
                        button.dataset.lang;
                    localStorage.setItem(
                        "cactuc_language",
                        currentLanguage
                    );
                    applyLanguage();
                    document
                        .getElementById(
                            "settings"
                        )
                        .classList
                        .add("hidden");
                };
        }
    );
/* =========================
   MESSAGE
========================= */
function message(text) {
    const box =
        document.getElementById(
            "gameMessage"
        );
    if (box) {
        box.textContent = text;
    }
}
/* =========================
   START
========================= */
applyLanguage();
