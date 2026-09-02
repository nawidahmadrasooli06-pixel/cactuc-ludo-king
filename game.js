/* =========================================================
   CACTUC LUDO KING 👑
   Local Ludo Engine
   ========================================================= */

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

/* =========================================================
   BASIC
   ========================================================= */

const CHANNEL_URL = "https://t.me/CROOK_Cake";
const USERNAME = "@cactuc580";

const COLORS = ["red", "yellow", "green", "blue"];

const COLOR_NAMES = {
    fa: {
        red: "قرمز",
        yellow: "زرد",
        green: "سبز",
        blue: "آبی"
    },
    en: {
        red: "Red",
        yellow: "Yellow",
        green: "Green",
        blue: "Green"
    },
    ar: {
        red: "أحمر",
        yellow: "أصفر",
        green: "أخضر",
        blue: "أزرق"
    },
    de: {
        red: "Rot",
        yellow: "Gelb",
        green: "Grün",
        blue: "Blau"
    },
    ru: {
        red: "Красный",
        yellow: "Жёлтый",
        green: "Зелёный",
        blue: "Синий"
    }
};

const DICE = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

let language = localStorage.getItem("cactuc_language") || "fa";

let players = [];
let currentPlayer = 0;
let currentRoll = 0;
let rolled = false;
let gameStarted = false;
let gameMode = "computer";
let rankings = [];
let selectedPlayerCount = 2;
let currentRoom = null;

/*
    Piece states:

    -1  = inside home
    0   = starting square
    1-51 = main track
    52-56 = final colored lane
    57  = center / finished
*/

/* =========================================================
   DOM
   ========================================================= */

const menu = document.getElementById("menu");
const roomScreen = document.getElementById("roomScreen");
const joinScreen = document.getElementById("joinScreen");
const gameScreen = document.getElementById("gameScreen");
const settings = document.getElementById("settings");

function showScreen(screen) {
    [menu, roomScreen, joinScreen, gameScreen]
        .forEach(x => x.classList.add("hidden"));

    screen.classList.remove("hidden");
}

/* =========================================================
   TELEGRAM
   ========================================================= */

function getPlayerName() {

    if (
        tg &&
        tg.initDataUnsafe &&
        tg.initDataUnsafe.user
    ) {
        return (
            tg.initDataUnsafe.user.first_name ||
            "Player"
        );
    }

    return "Player";
}

function openChannel() {

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(CHANNEL_URL);
    } else {
        window.open(CHANNEL_URL, "_blank");
    }
}

/* =========================================================
   CHANNEL BUTTON
   ========================================================= */

const channelButton = document.createElement("button");

channelButton.className = "menuBtn";
channelButton.textContent = "📢 کانال من";
channelButton.onclick = openChannel;

const creator = document.querySelector(".creator");

if (creator) {
    menu.insertBefore(channelButton, creator);
}

/* =========================================================
   BOARD MAP
   ========================================================= */

/*
    Classic 15 x 15 Ludo board.

    The outer route contains 52 cells.
*/

const PATH = [

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

/*
    Each color enters the main track
    at its own starting index.
*/

const START_INDEX = {
    red: 0,
    yellow: 13,
    green: 26,
    blue: 39
};

/*
    Safe positions on the 52-cell route.
*/

const SAFE = new Set([
    0,
    8,
    13,
    21,
    26,
    34,
    39,
    47
]);

/*
    Colored final lanes.
*/

const LANES = {

    red: [
        [5,7],
        [4,7],
        [3,7],
        [2,7],
        [1,7],
        [0,7]
    ],

    yellow: [
        [7,9],
        [7,10],
        [7,11],
        [7,12],
        [7,13],
        [7,14]
    ],

    green: [
        [9,7],
        [10,7],
        [11,7],
        [12,7],
        [13,7],
        [14,7]
    ],

    blue: [
        [7,5],
        [7,4],
        [7,3],
        [7,2],
        [7,1],
        [7,0]
    ]
};

/* =========================================================
   HOME POSITIONS
   ========================================================= */

const HOME_SPOTS = {

    red: [
        [1,1],
        [1,4],
        [4,1],
        [4,4]
    ],

    yellow: [
        [1,10],
        [1,13],
        [4,10],
        [4,13]
    ],

    green: [
        [10,1],
        [10,4],
        [13,1],
        [13,4]
    ],

    blue: [
        [10,10],
        [10,13],
        [13,10],
        [13,13]
    ]
};

/* =========================================================
   HELPERS
   ========================================================= */

function getColorName(color) {
    return (
        COLOR_NAMES[language]?.[color] ||
        COLOR_NAMES.fa[color]
    );
}

function getCell(row, col) {
    const board = document.getElementById("board");

    if (!board) return null;

    return board.children[row * 15 + col];
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function message(text) {

    const element =
        document.getElementById("gameMessage");

    if (element) {
        element.textContent = text;
    }
}

/* =========================================================
   RESET
   ========================================================= */

function resetGame(count = 2) {

    players = [];

    for (let i = 0; i < count; i++) {

        players.push({

            color: COLORS[i],

            /*
                Four pieces start inside home.
            */

            pieces: [-1, -1, -1, -1],

            finished: 0,

            eliminated: false
        });
    }

    currentPlayer = 0;
    currentRoll = 0;
    rolled = false;
    rankings = [];
    gameStarted = true;
}

/* =========================================================
   PIECE POSITION
   ========================================================= */

function getPieceBoardPosition(playerIndex, pieceIndex) {

    const player = players[playerIndex];

    if (!player) return null;

    const value = player.pieces[pieceIndex];

    /*
        Inside home.
    */

    if (value === -1) {

        return {
            type: "home",
            position: HOME_SPOTS[player.color][pieceIndex]
        };
    }

    /*
        Finished pieces stay in center.
    */

    if (value === 57) {

        return {
            type: "finish",
            position: [7, 7]
        };
    }

    /*
        Main route.
    */

    if (value >= 0 && value <= 51) {

        const routeIndex =
            (
                START_INDEX[player.color] +
                value
            ) % 52;

        return {
            type: "path",
            position: PATH[routeIndex],
            routeIndex
        };
    }

    /*
        Final colored lane.
    */

    if (value >= 52 && value <= 56) {

        const laneIndex = value - 52;

        return {
            type: "lane",
            position:
                LANES[player.color][laneIndex]
        };
    }

    return null;
}

/* =========================================================
   BOARD CREATION
   ========================================================= */

function buildBoard() {

    const board =
        document.getElementById("board");

    board.innerHTML = "";

    /*
        Create 225 cells.
    */

    for (let row = 0; row < 15; row++) {

        for (let col = 0; col < 15; col++) {

            const cell =
                document.createElement("div");

            cell.className = "cell";

            /*
                Four home yards.
            */

            if (row <= 5 && col <= 5) {
                cell.classList.add("home-red");
            }

            else if (row <= 5 && col >= 9) {
                cell.classList.add("home-yellow");
            }

            else if (row >= 9 && col <= 5) {
                cell.classList.add("home-green");
            }

            else if (row >= 9 && col >= 9) {
                cell.classList.add("home-blue");
            }

            board.appendChild(cell);
        }
    }

    /*
        Main path.
    */

    PATH.forEach((position, index) => {

        const el =
            getCell(position[0], position[1]);

        el.className = "cell path";

        if (SAFE.has(index)) {
            el.classList.add("safe");
        }

        if (index === START_INDEX.red) {
            el.classList.add("start-red");
        }

        if (index === START_INDEX.yellow) {
            el.classList.add("start-yellow");
        }

        if (index === START_INDEX.green) {
            el.classList.add("start-green");
        }

        if (index === START_INDEX.blue) {
            el.classList.add("start-blue");
        }
    });

    /*
        Final lanes.
    */

    Object.entries(LANES).forEach(
        ([color, positions]) => {

            positions.forEach(([row, col]) => {

                const el = getCell(row, col);

                el.className =
                    "cell lane-" + color;
            });
        }
    );

    /*
        Center.
    */

    for (let row = 6; row <= 8; row++) {

        for (let col = 6; col <= 8; col++) {

            const el = getCell(row, col);

            el.className = "cell center";
        }
    }

    /*
        Home circles.
    */

    createHomeSpots();
}

/* =========================================================
   HOME CIRCLES
   ========================================================= */

function createHomeSpots() {

    Object.entries(HOME_SPOTS)
        .forEach(([color, spots]) => {

            spots.forEach(([row, col]) => {

                const cell =
                    getCell(row, col);

                /*
                    Keep the colored yard visible.
                */

                cell.innerHTML = "";

                const inner =
                    document.createElement("div");

                inner.className = "homeInner";

                const spot =
                    document.createElement("div");

                spot.className = "homeSpot";

                inner.appendChild(spot);

                cell.appendChild(inner);
            });
        });
}

/* =========================================================
   MOVEMENT RULE
   ========================================================= */

function canMove(playerIndex, pieceIndex, dice) {

    const value =
        players[playerIndex].pieces[pieceIndex];

    /*
        Finished.
    */

    if (value === 57) {
        return false;
    }

    /*
        Home -> requires six.
    */

    if (value === -1) {
        return dice === 6;
    }

    /*
        Main route and final lane.

        Maximum is 57.
    */

    return value + dice <= 57;
}

/* =========================================================
   RENDER
   ========================================================= */

function render() {

    /*
        Remove old pieces.
    */

    document
        .querySelectorAll(".piece")
        .forEach(piece => piece.remove());

    /*
        Render every piece.
    */

    players.forEach((player, playerIndex) => {

        player.pieces.forEach(
            (value, pieceIndex) => {

                const data =
                    getPieceBoardPosition(
                        playerIndex,
                        pieceIndex
                    );

                if (!data) return;

                /*
                    Finished pieces.
                */

                if (data.type === "finish") {

                    renderFinishedPiece(
                        player,
                        playerIndex,
                        pieceIndex
                    );

                    return;
                }

                /*
                    Normal piece.
                */

                const cell =
                    getCell(
                        data.position[0],
                        data.position[1]
                    );

                if (!cell) return;

                const piece =
                    document.createElement("button");

                piece.className =
                    "piece " + player.color;

                piece.type = "button";

                /*
                    Selectable pieces.
                */

                if (
                    playerIndex === currentPlayer &&
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

                    piece.onclick = () => {

                        movePiece(
                            playerIndex,
                            pieceIndex
                        );
                    };
                }

                /*
                    Home pieces are positioned
                    directly inside their circle.
                */

                if (data.type === "home") {

                    cell.innerHTML = "";

                    const inner =
                        document.createElement("div");

                    inner.className = "homeInner";

                    const spot =
                        document.createElement("div");

                    spot.className = "homeSpot";

                    inner.appendChild(spot);

                    cell.appendChild(inner);

                    spot.appendChild(piece);

                } else {

                    cell.appendChild(piece);
                }
            }
        );
    });

    renderPlayers();
    renderTurn();
    renderRankings();
}

/* =========================================================
   FINISHED PIECES
   ========================================================= */

function renderFinishedPiece(
    player,
    playerIndex,
    pieceIndex
) {

    const center =
        getCell(7, 7);

    if (!center) return;

    /*
        Finished pieces remain visible
        around the trophy.
    */

    const piece =
        document.createElement("button");

    piece.type = "button";

    piece.className =
        "piece " +
        player.color +
        " finishedPiece";

    const offsets = [
        [-1,-1],
        [-1,1],
        [1,-1],
        [1,1]
    ];

    const [rowOffset, colOffset] =
        offsets[pieceIndex];

    piece.style.position = "absolute";

    piece.style.width = "27%";
    piece.style.height = "27%";

    piece.style.left =
        `calc(50% + ${colOffset * 25}% - 13.5%)`;

    piece.style.top =
        `calc(50% + ${rowOffset * 25}% - 13.5%)`;

    piece.style.zIndex = 200 + playerIndex;

    center.appendChild(piece);
}

/* =========================================================
   TURN
   ========================================================= */

function renderTurn() {

    if (!players.length) return;

    const player =
        players[currentPlayer];

    const turn =
        document.getElementById("turnText");

    if (!turn) return;

    turn.textContent =
        "نوبت " +
        getColorName(player.color);
}

/* =========================================================
   PLAYER CARDS
   ========================================================= */

function renderPlayers() {

    const panel =
        document.getElementById("playersPanel");

    if (!panel) return;

    panel.innerHTML = "";

    players.forEach(
        (player, index) => {

            const card =
                document.createElement("div");

            card.className = "playerCard";

            if (index === currentPlayer) {
                card.classList.add("active");
            }

            const info =
                document.createElement("div");

            info.className = "playerInfo";

            const name =
                document.createElement("div");

            name.className = "playerColor";

            const icons = [
                "🔴",
                "🟡",
                "🟢",
                "🔵"
            ];

            name.textContent =
                icons[index] +
                " " +
                getColorName(player.color);

            const status =
                document.createElement("div");

            status.className = "playerStatus";

            status.textContent =
                player.finished +
                "/4 به پایان رسیده";

            info.appendChild(name);
            info.appendChild(status);

            /*
                Every player gets their own dice.
            */

            const dice =
                document.createElement("button");

            dice.type = "button";

            dice.className = "diceBtn";

            let face = "⚄";

            if (
                index === currentPlayer &&
                rolled &&
                currentRoll >= 1 &&
                currentRoll <= 6
            ) {
                face = DICE[currentRoll - 1];
            }

            dice.innerHTML =
                face +
                "<small>تاس</small>";

            if (index === currentPlayer) {

                dice.classList.add("yourTurn");

                dice.onclick = rollDice;

            } else {

                dice.disabled = true;
                dice.style.opacity = ".38";
            }

            card.appendChild(info);
            card.appendChild(dice);

            panel.appendChild(card);
        }
    );
}

/* =========================================================
   RANKINGS
   ========================================================= */

function renderRankings() {

    const box =
        document.getElementById("rankText");

    if (!box) return;

    if (!rankings.length) {
        box.innerHTML = "";
        return;
    }

    const medals = [
        "🥇",
        "🥈",
        "🥉",
        "🏅"
    ];

    box.innerHTML =
        rankings.map(
            (playerIndex, rank) => {

                const player =
                    players[playerIndex];

                return (
                    medals[rank] +
                    " " +
                    getColorName(player.color)
                );
            }
        ).join("<br>");
}

/* =========================================================
   DICE
   ========================================================= */

function rollDice() {

    if (!gameStarted) return;

    if (rolled) return;

    /*
        Human controls only player 0
        in computer mode.
    */

    if (
        gameMode === "computer" &&
        currentPlayer !== 0
    ) {
        return;
    }

    currentRoll =
        Math.floor(Math.random() * 6) + 1;

    rolled = true;

    render();

    message(
        "🎲 تاس آمد: " +
        currentRoll
    );

    const possible =
        players[currentPlayer]
            .pieces
            .some(
                (_, pieceIndex) =>
                    canMove(
                        currentPlayer,
                        pieceIndex,
                        currentRoll
                    )
            );

    /*
        No legal move.
    */

    if (!possible) {

        message(
            "با این عدد هیچ مهره‌ای حرکت نمی‌کند."
        );

        setTimeout(() => {

            if (currentRoll === 6) {

                /*
                    Six gives another roll.
                */

                rolled = false;
                currentRoll = 0;

                render();

                message(
                    "🎲 شش آمد! دوباره تاس بزن."
                );

            } else {

                nextTurn();
            }

        }, 900);

        return;
    }

    /*
        Computer automatically selects.
    */

    if (
        gameMode === "computer" &&
        currentPlayer !== 0
    ) {

        setTimeout(
            computerMove,
            750
        );
    }
}

/* =========================================================
   MOVE
   ========================================================= */

async function movePiece(
    playerIndex,
    pieceIndex
) {

    if (playerIndex !== currentPlayer) {
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

    const dice = currentRoll;

    rolled = false;

    const player =
        players[playerIndex];

    let value =
        player.pieces[pieceIndex];

    /*
        Six brings piece onto start.
    */

    if (value === -1) {

        player.pieces[pieceIndex] = 0;

        render();

        message(
            "🎉 مهره وارد زمین شد!"
        );

        await wait(400);

    }

    else {

        /*
            Move one square at a time.
        */

        for (let step = 0; step < dice; step++) {

            player.pieces[pieceIndex]++;

            render();

            await wait(130);
        }
    }

    /*
        Reached center.
    */

    if (
        player.pieces[pieceIndex] === 57
    ) {

        player.finished++;

        render();

        message(
            "🏆 مهره به مرکز رسید!"
        );

        await wait(650);
    }

    /*
        Capture.
    */

    captureOpponent(
        playerIndex,
        pieceIndex
    );

    render();

    /*
        Player completed all four.
    */

    if (player.finished === 4) {

        if (!rankings.includes(playerIndex)) {

            rankings.push(playerIndex);
        }

        renderRankings();

        message(
            "👑 " +
            getColorName(player.color) +
            " همه مهره‌ها را به خانه رساند!"
        );

        await wait(800);

        /*
            If everybody is ranked,
            game ends.
        */

        if (rankings.length === players.length) {

            message(
                "🏆 بازی تمام شد!"
            );

            return;
        }
    }

    /*
        Six = another turn.
    */

    if (dice === 6) {

        rolled = false;
        currentRoll = 0;

        render();

        message(
            "🎲 شش آمد! دوباره تاس بزن."
        );

        if (
            gameMode === "computer" &&
            currentPlayer !== 0
        ) {

            setTimeout(
                rollDice,
                750
            );
        }

        return;
    }

    nextTurn();
}

/* =========================================================
   CAPTURE
   ========================================================= */

function captureOpponent(
    playerIndex,
    pieceIndex
) {

    const player =
        players[playerIndex];

    const value =
        player.pieces[pieceIndex];

    /*
        Only pieces on main track
        can capture.
    */

    if (
        value < 0 ||
        value > 51
    ) {
        return;
    }

    const routeIndex =
        (
            START_INDEX[player.color] +
            value
        ) % 52;

    /*
        Safe square.
    */

    if (SAFE.has(routeIndex)) {
        return;
    }

    players.forEach(
        (opponent, opponentIndex) => {

            if (opponentIndex === playerIndex) {
                return;
            }

            opponent.pieces =
                opponent.pieces.map(
                    enemyValue => {

                        if (
                            enemyValue >= 0 &&
                            enemyValue <= 51
                        ) {

                            const enemyRoute =
                                (
                                    START_INDEX[
                                        opponent.color
                                    ] +
                                    enemyValue
                                ) % 52;

                            if (
                                enemyRoute === routeIndex
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
   NEXT TURN
   ========================================================= */

function nextTurn() {

    currentPlayer =
        (
            currentPlayer + 1
        ) % players.length;

    currentRoll = 0;
    rolled = false;

    render();

    if (
        gameMode === "computer" &&
        currentPlayer !== 0
    ) {

        message(
            "🤖 نوبت کامپیوتر..."
        );

        setTimeout(
            rollDice,
            900
        );

    } else {

        message(
            "👉 نوبت تو — تاس را بزن"
        );
    }
}

/* =========================================================
   COMPUTER
   ========================================================= */

function computerMove() {

    if (!rolled) return;

    const player =
        players[currentPlayer];

    const possible =
        player.pieces
            .map((_, index) => index)
            .filter(
                index =>
                    canMove(
                        currentPlayer,
                        index,
                        currentRoll
                    )
            );

    if (!possible.length) {

        nextTurn();

        return;
    }

    /*
        Priority:

        1. Finish a piece.
        2. Capture.
        3. Leave home with six.
        4. Move a normal piece.
    */

    let chosen =
        possible[0];

    /*
        Finish first.
    */

    for (const index of possible) {

        const value =
            player.pieces[index];

        const newValue =
            value === -1
                ? 0
                : value + currentRoll;

        if (newValue === 57) {

            chosen = index;

            break;
        }
    }

    /*
        With six, prefer home piece.
    */

    if (currentRoll === 6) {

        const homePiece =
            possible.find(
                index =>
                    player.pieces[index] === -1
            );

        if (homePiece !== undefined) {
            chosen = homePiece;
        }
    }

    /*
        Small random variation.
    */

    if (
        possible.length > 1 &&
        Math.random() < 0.25
    ) {

        chosen =
            possible[
                Math.floor(
                    Math.random() *
                    possible.length
                )
            ];
    }

    movePiece(
        currentPlayer,
        chosen
    );
}

/* =========================================================
   COMPUTER GAME
   ========================================================= */

function startComputerGame() {

    gameMode = "computer";

    resetGame(2);

    buildBoard();

    showScreen(gameScreen);

    render();

    message(
        "🎮 تو قرمز هستی — تاس را بزن"
    );
}

/* =========================================================
   ROOM
   ========================================================= */

function createRoomCode() {

    return String(
        Math.floor(
            100000 +
            Math.random() * 900000
        )
    );
}

function renderRoomPlayers() {

    const box =
        document.getElementById(
            "roomPlayers"
        );

    box.innerHTML = "";

    for (
        let i = 0;
        i < selectedPlayerCount;
        i++
    ) {

        const div =
            document.createElement("div");

        div.className = "roomPlayer";

        if (i === 0) {

            div.textContent =
                "🔴 " +
                getPlayerName();

        } else {

            const icons = [
                "🔴",
                "🟡",
                "🟢",
                "🔵"
            ];

            div.textContent =
                icons[i] +
                " ⏳ در انتظار بازیکن...";
        }

        box.appendChild(div);
    }
}

function createRoom() {

    currentRoom =
        createRoomCode();

    document.getElementById(
        "roomCode"
    ).textContent =
        currentRoom;

    renderRoomPlayers();

    showScreen(roomScreen);
}

/* =========================================================
   ROOM COUNT
   ========================================================= */

document
    .querySelectorAll(".roomCount button")
    .forEach(button => {

        button.onclick = () => {

            selectedPlayerCount =
                Number(
                    button.dataset.count
                );

            document
                .querySelectorAll(
                    ".roomCount button"
                )
                .forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

            button.classList.add("active");

            renderRoomPlayers();
        };
    });

const defaultCount =
    document.querySelector(
        '.roomCount button[data-count="2"]'
    );

if (defaultCount) {
    defaultCount.classList.add("active");
}

/* =========================================================
   COPY ROOM CODE
   ========================================================= */

document.getElementById(
    "copyCodeBtn"
).onclick = async () => {

    if (!currentRoom) return;

    try {

        await navigator.clipboard.writeText(
            currentRoom
        );

    } catch {

        const input =
            document.createElement("input");

        input.value =
            currentRoom;

        document.body.appendChild(input);

        input.select();

        document.execCommand("copy");

        input.remove();
    }

    message("کد اتاق کپی شد ✓");
};

/* =========================================================
   JOIN ROOM
   ========================================================= */

document.getElementById(
    "joinBtn"
).onclick = () => {

    const value =
        document.getElementById(
            "roomInput"
        ).value.trim();

    if (!/^\d{6}$/.test(value)) {

        alert(
            "کد باید دقیقاً ۶ رقمی باشد."
        );

        return;
    }

    /*
        Online server will be connected
        in the next stage.

        For now we do not pretend
        that this is a real online room.
    */

    alert(
        "اتصال آنلاین در مرحله بعد فعال می‌شود."
    );
};

/* =========================================================
   MENU BUTTONS
   ========================================================= */

document.getElementById(
    "computerBtn"
).onclick =
    startComputerGame;

document.getElementById(
    "createRoomBtn"
).onclick =
    createRoom;

document.getElementById(
    "joinRoomBtn"
).onclick =
    () => showScreen(joinScreen);

document.getElementById(
    "backBtn"
).onclick =
    () => showScreen(menu);

document.getElementById(
    "backJoinBtn"
).onclick =
    () => showScreen(menu);

/*
    Local room test.
*/

document.getElementById(
    "startBtn"
).onclick = () => {

    gameMode = "local";

    resetGame(
        selectedPlayerCount
    );

    buildBoard();

    showScreen(gameScreen);

    render();

    message(
        "🎮 بازی شروع شد!"
    );
};

/* =========================================================
   SETTINGS
   ========================================================= */

document.getElementById(
    "settingsBtn"
).onclick = () => {

    settings.classList.remove(
        "hidden"
    );
};

document.getElementById(
    "closeSettings"
).onclick = () => {

    settings.classList.add(
        "hidden"
    );
};

/* =========================================================
   LANGUAGE
   ========================================================= */

document
    .querySelectorAll("[data-lang]")
    .forEach(button => {

        button.onclick = () => {

            language =
                button.dataset.lang;

            localStorage.setItem(
                "cactuc_language",
                language
            );

            settings.classList.add(
                "hidden"
            );

            render();

            message(
                "زبان انتخاب شد ✓"
            );
        };
    });

/* =========================================================
   START
   ========================================================= */

showScreen(menu);
