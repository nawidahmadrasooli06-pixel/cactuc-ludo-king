const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}
/* =====================================================
   CACTUC LUDO KING
   LOCAL TEST VERSION
   PLAYER VS COMPUTER
===================================================== */
const board = document.getElementById("board");
const menu = document.getElementById("menu");
const playerCountScreen =
  document.getElementById("playerCountScreen");
const roomScreen =
  document.getElementById("roomScreen");
const joinScreen =
  document.getElementById("joinScreen");
const gameScreen =
  document.getElementById("gameScreen");
const settings =
  document.getElementById("settings");
const playerDice =
  document.getElementById("playerDice");
const botDice =
  document.getElementById("botDice");
const playerHint =
  document.getElementById("playerHint");
const botHint =
  document.getElementById("botHint");
const turnText =
  document.getElementById("turnText");
const gameMessage =
  document.getElementById("gameMessage");
let gameMode = "computer";
let currentPlayer = 0;
let rolled = false;
let currentRoll = 0;
let moving = false;
const colors = [
  "blue",
  "red"
];
const names = [
  "تو",
  "کامپیوتر"
];
/* =====================================================
   LUDO PATH
===================================================== */
const path = [
  [50, 17],
  [43, 17],
  [37, 17],
  [30, 17],
  [23, 17],
  [17, 23],
  [17, 30],
  [17, 37],
  [17, 43],
  [17, 50],
  [17, 57],
  [17, 63],
  [23, 63],
  [30, 63],
  [37, 63],
  [43, 70],
  [50, 70],
  [57, 70],
  [63, 70],
  [70, 63],
  [70, 57],
  [70, 50],
  [70, 43],
  [70, 37],
  [70, 30],
  [63, 30],
  [57, 30],
  [50, 30],
  [50, 37],
  [50, 43],
  [50, 50],
  [50, 57]
];
/*
  Four home positions.
*/
const homePositions = {
  blue: [
    [29, 76],
    [42, 76],
    [29, 88],
    [42, 88]
  ],
  red: [
    [29, 12],
    [42, 12],
    [29, 24],
    [42, 24]
  ]
};
/* =====================================================
   PLAYER DATA
===================================================== */
let players = [
  {
    color: "blue",
    pieces: [-1, -1, -1, -1]
  },
  {
    color: "red",
    pieces: [-1, -1, -1, -1]
  }
];
/*
  -1 = inside home
  0..27 = track
  28..31 = final lane
  32 = finished
*/
/* =====================================================
   DICE
===================================================== */
const diceFaces = [
  "⚀",
  "⚁",
  "⚂",
  "⚃",
  "⚄",
  "⚅"
];
function setDice(button, number) {
  if (!button) return;
  button.firstChild.textContent =
    diceFaces[number - 1] || "⚄";
}
/* =====================================================
   SCREEN
===================================================== */
function hideAllScreens() {
  menu.classList.add("hidden");
  playerCountScreen.classList.add("hidden");
  roomScreen.classList.add("hidden");
  joinScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
}
function show(screen) {
  hideAllScreens();
  screen.classList.remove("hidden");
}
/* =====================================================
   PLAYER COUNT
===================================================== */
document
  .querySelectorAll(".countBtn")
  .forEach(button => {
    button.onclick = () => {
      const count =
        Number(button.dataset.count);
      if (count === 2) {
        startComputerGame();
      } else {
        alert(
          "بازی چندنفره آنلاین در مرحله بعد فعال می‌شود."
        );
      }
    };
  });
/* =====================================================
   START COMPUTER GAME
===================================================== */
function startComputerGame() {
  gameMode = "computer";
  players = [
    {
      color: "blue",
      pieces: [-1, -1, -1, -1]
    },
    {
      color: "red",
      pieces: [-1, -1, -1, -1]
    }
  ];
  currentPlayer = 0;
  rolled = false;
  currentRoll = 0;
  moving = false;
  setDice(playerDice, 5);
  setDice(botDice, 5);
  show(gameScreen);
  playerHint.textContent =
    "نوبت تو — تاس را بزن";
  botHint.textContent =
    "منتظر نوبت";
  playerHint.classList.add("active");
  botHint.classList.remove("active");
  turnText.textContent =
    "🔵 نوبت تو";
  gameMessage.textContent =
    "تاس را بزن";
  renderBoard();
}
/* =====================================================
   BOARD
===================================================== */
function renderBoard() {
  board
    .querySelectorAll(".boardPiece")
    .forEach(piece => piece.remove());
  board
    .querySelectorAll(".rankBadge")
    .forEach(badge => badge.remove());
  players.forEach(
    (player, playerIndex) => {
      player.pieces.forEach(
        (position, pieceIndex) => {
          if (position === -1) {
            return;
          }
          const piece =
            document.createElement("button");
          piece.className =
            `boardPiece ${player.color}`;
          piece.dataset.player =
            playerIndex;
          piece.dataset.piece =
            pieceIndex;
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
          }
          let coords =
            getPieceCoordinates(
              playerIndex,
              pieceIndex,
              position
            );
          piece.style.left =
            coords[0] + "%";
          piece.style.top =
            coords[1] + "%";
          piece.onclick = () => {
            if (
              playerIndex !==
              currentPlayer
            ) {
              return;
            }
            movePiece(
              playerIndex,
              pieceIndex
            );
          };
          board.appendChild(piece);
        }
      );
    });
}
/* =====================================================
   COORDINATES
===================================================== */
function getPieceCoordinates(
  playerIndex,
  pieceIndex,
  position
) {
  const player =
    players[playerIndex];
  const color =
    player.color;
  /*
    Finished pieces remain visible
    around the center.
  */
  if (position === 32) {
    const finishPositions =
      color === "blue"
        ? [
            [45, 45],
            [48, 45],
            [45, 49],
            [48, 49]
          ]
        : [
            [52, 51],
            [55, 51],
            [52, 55],
            [55, 55]
          ];
    return finishPositions[pieceIndex];
  }
  /*
    Home pieces.
  */
  if (position === -1) {
    return homePositions[
      color
    ][pieceIndex];
  }
  /*
    Normal path.
  */
  if (position < 28) {
    return path[position];
  }
  /*
    Final lane.
  */
  const lane = position - 28;
  if (color === "blue") {
    return [
      50,
      63 - lane * 5
    ];
  }
  return [
    50,
    37 + lane * 5
  ];
}
/* =====================================================
   MOVEMENT RULE
===================================================== */
function canMove(
  playerIndex,
  pieceIndex,
  dice
) {
  const value =
    players[playerIndex]
      .pieces[pieceIndex];
  if (value === 32) {
    return false;
  }
  /*
    Six takes a piece out of home.
  */
  if (value === -1) {
    return dice === 6;
  }
  return (
    value + dice <= 32
  );
}
/* =====================================================
   ROLL PLAYER
===================================================== */
playerDice.onclick = () => {
  if (
    currentPlayer !== 0 ||
    rolled ||
    moving
  ) {
    return;
  }
  rollPlayerDice();
};
function rollPlayerDice() {
  currentRoll =
    Math.floor(
      Math.random() * 6
    ) + 1;
  setDice(
    playerDice,
    currentRoll
  );
  rolled = true;
  playerHint.classList.remove(
    "active"
  );
  gameMessage.textContent =
    `تاس تو: ${currentRoll}`;
  renderBoard();
  const possible =
    players[0]
      .pieces
      .some(
        (_, index) =>
          canMove(
            0,
            index,
            currentRoll
          )
      );
  if (!possible) {
    gameMessage.textContent =
      "حرکت ممکن نیست.";
    rolled = false;
    setTimeout(
      nextTurn,
      900
    );
    return;
  }
  /*
    If six comes,
    player chooses the piece.
  */
  if (currentRoll === 6) {
    gameMessage.textContent =
      "🎉 شش آوردی! مهره‌ات را انتخاب کن.";
  } else {
    gameMessage.textContent =
      "مهره قابل حرکت را انتخاب کن.";
  }
}
/* =====================================================
   MOVE PIECE
===================================================== */
function movePiece(
  playerIndex,
  pieceIndex
) {
  if (moving) return;
  if (
    playerIndex !==
    currentPlayer
  ) {
    return;
  }
  if (!rolled) return;
  if (
    !canMove(
      playerIndex,
      pieceIndex,
      currentRoll
    )
  ) {
    return;
  }
  moving = true;
  const dice =
    currentRoll;
  let value =
    players[playerIndex]
      .pieces[pieceIndex];
  /*
    Leaving home.
  */
  if (value === -1) {
    value = 0;
  } else {
    value += dice;
  }
  /*
    Animate step by step.
  */
  animatePieceMove(
    playerIndex,
    pieceIndex,
    value
  );
}
/* =====================================================
   ANIMATION
===================================================== */
function animatePieceMove(
  playerIndex,
  pieceIndex,
  target
) {
  let current =
    players[playerIndex]
      .pieces[pieceIndex];
  if (current === -1) {
    current = 0;
    players[playerIndex]
      .pieces[pieceIndex] =
      current;
    renderBoard();
  }
  if (current >= target) {
    finishMove(
      playerIndex,
      pieceIndex
    );
    return;
  }
  current++;
  players[playerIndex]
    .pieces[pieceIndex] =
    current;
  renderBoard();
  setTimeout(
    () => {
      animatePieceMove(
        playerIndex,
        pieceIndex,
        target
      );
    },
    100
  );
}
/* =====================================================
   FINISH MOVE
===================================================== */
function finishMove(
  playerIndex,
  pieceIndex
) {
  rolled = false;
  moving = false;
  capturePiece(
    playerIndex,
    pieceIndex
  );
  const value =
    players[playerIndex]
      .pieces[pieceIndex];
  if (value === 32) {
    celebration(
      playerIndex
    );
  }
  renderBoard();
  const won =
    players[playerIndex]
      .pieces
      .every(
        p => p === 32
      );
  if (won) {
    showWinner(
      playerIndex
    );
    return;
  }
  /*
    Six = another roll.
  */
  if (currentRoll === 6) {
    gameMessage.textContent =
      playerIndex === 0
        ? "🎉 شش! دوباره تاس بزن."
        : "کامپیوتر دوباره بازی می‌کند.";
    rolled = false;
    if (playerIndex === 0) {
      playerHint.classList.add(
        "active"
      );
    } else {
      setTimeout(
        computerTurn,
        800
      );
    }
    return;
  }
  nextTurn();
}
/* =====================================================
   CAPTURE
===================================================== */
function capturePiece(
  playerIndex,
  pieceIndex
) {
  const value =
    players[playerIndex]
      .pieces[pieceIndex];
  if (
    value < 0 ||
    value >= 28
  ) {
    return;
  }
  players.forEach(
    (enemy, enemyIndex) => {
      if (
        enemyIndex ===
        playerIndex
      ) {
        return;
      }
      enemy.pieces =
        enemy.pieces.map(
          enemyValue => {
            if (
              enemyValue >= 0 &&
              enemyValue < 28
            ) {
              if (
                enemyValue ===
                value
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
/* =====================================================
   TURN
===================================================== */
function nextTurn() {
  currentPlayer =
    currentPlayer === 0
      ? 1
      : 0;
  rolled = false;
  currentRoll = 0;
  updateTurnUI();
  renderBoard();
  if (
    currentPlayer === 1
  ) {
    setTimeout(
      computerTurn,
      900
    );
  }
}
/* =====================================================
   TURN UI
===================================================== */
function updateTurnUI() {
  if (currentPlayer === 0) {
    turnText.textContent =
      "🔵 نوبت تو";
    playerHint.textContent =
      "نوبت تو — تاس را بزن";
    playerHint.classList.add(
      "active"
    );
    botHint.textContent =
      "منتظر نوبت";
    botHint.classList.remove(
      "active"
    );
  } else {
    turnText.textContent =
      "🔴 نوبت کامپیوتر";
    playerHint.textContent =
      "منتظر نوبت کامپیوتر";
    playerHint.classList.remove(
      "active"
    );
    botHint.textContent =
      "🤖 نوبت کامپیوتر";
    botHint.classList.add(
      "active"
    );
  }
}
/* =====================================================
   COMPUTER
===================================================== */
function computerTurn() {
  if (
    currentPlayer !== 1 ||
    moving
  ) {
    return;
  }
  currentRoll =
    Math.floor(
      Math.random() * 6
    ) + 1;
  setDice(
    botDice,
    currentRoll
  );
  rolled = true;
  gameMessage.textContent =
    `🤖 کامپیوتر ${currentRoll} آورد`;
  renderBoard();
  const possible =
    players[1]
      .pieces
      .map(
        (_, index) =>
          index
      )
      .filter(
        index =>
          canMove(
            1,
            index,
            currentRoll
          )
      );
  if (
    possible.length === 0
  ) {
    rolled = false;
    setTimeout(
      nextTurn,
      700
    );
    return;
  }
  /*
    AI priorities:
    1. Finish piece
    2. Capture
    3. Leave home
    4. Move any piece
  */
  let chosen =
    possible[0];
  for (
    const index of possible
  ) {
    const value =
      players[1]
        .pieces[index];
    const nextValue =
      value === -1
        ? 0
        : value + currentRoll;
    if (
      nextValue === 32
    ) {
      chosen = index;
      break;
    }
  }
  setTimeout(
    () => {
      movePiece(
        1,
        chosen
      );
    },
    700
  );
}
/* =====================================================
   CELEBRATION
===================================================== */
function celebration(
  playerIndex
) {
  const text =
    playerIndex === 0
      ? "🎉 مهره تو به مقصد رسید!"
      : "🎉 مهره کامپیوتر به مقصد رسید!";
  gameMessage.textContent =
    text;
  const cup =
    board.querySelector(".cup");
  if (cup) {
    cup.style.transform =
      "scale(1.3)";
    setTimeout(
      () => {
        cup.style.transform =
          "";
      },
      500
    );
  }
}
/* =====================================================
   WINNER
===================================================== */
function showWinner(
  playerIndex
) {
  const winner =
    playerIndex === 0
      ? "🔵 تو برنده شدی! 👑"
      : "🔴 کامپیوتر برنده شد! 🤖";
  turnText.textContent =
    winner;
  gameMessage.textContent =
    "🏆 بازی تمام شد.";
  playerHint.classList.remove(
    "active"
  );
  botHint.classList.remove(
    "active"
  );
  renderBoard();
}
/* =====================================================
   MENU BUTTONS
===================================================== */
document
  .getElementById("computerBtn")
  .onclick = () => {
    startComputerGame();
  };
document
  .getElementById("quickGameBtn")
  .onclick = () => {
    show(playerCountScreen);
  };
document
  .getElementById("createRoomBtn")
  .onclick = () => {
    show(playerCountScreen);
  };
document
  .getElementById("joinRoomBtn")
  .onclick = () => {
    show(joinScreen);
  };
/* =====================================================
   BACK BUTTONS
===================================================== */
document
  .getElementById("countBackBtn")
  .onclick = () => {
    show(menu);
  };
document
  .getElementById("roomBackBtn")
  .onclick = () => {
    show(menu);
  };
document
  .getElementById("joinBackBtn")
  .onclick = () => {
    show(menu);
  };
document
  .getElementById("gameBackBtn")
  .onclick = () => {
    show(menu);
  };
/* =====================================================
   ROOM PLACEHOLDER
===================================================== */
document
  .getElementById("startRoomBtn")
  .onclick = () => {
    alert(
      "اتصال آنلاین در مرحله بعد فعال می‌شود."
    );
  };
document
  .getElementById("joinBtn")
  .onclick = () => {
    const code =
      document
        .getElementById("roomInput")
        .value
        .trim();
    if (
      !/^\d{6}$/.test(code)
    ) {
      alert(
        "کد اتاق باید ۶ رقمی باشد."
      );
      return;
    }
    alert(
      "سیستم آنلاین اتاق در مرحله بعد فعال می‌شود."
    );
  };
/* =====================================================
   COPY
===================================================== */
document
  .getElementById("copyCodeBtn")
  .onclick = async () => {
    const code =
      document
        .getElementById("roomCode")
        .textContent;
    try {
      await navigator.clipboard.writeText(
        code
      );
      alert(
        "کد کپی شد!"
      );
    } catch {
      alert(
        "کد: " + code
      );
    }
  };
/* =====================================================
   SETTINGS
===================================================== */
document
  .getElementById("settingsBtn")
  .onclick = () => {
    settings.classList.remove(
      "hidden"
    );
  };
document
  .getElementById("closeSettings")
  .onclick = () => {
    settings.classList.add(
      "hidden"
    );
  };
/* =====================================================
   LANGUAGE
===================================================== */
document
  .querySelectorAll(
    "[data-lang]"
  )
  .forEach(
    button => {
      button.onclick = () => {
        const lang =
          button.dataset.lang;
        localStorage.setItem(
          "cactuc_language",
          lang
        );
        settings.classList.add(
          "hidden"
        );
        alert(
          "زبان انتخاب شد: " +
          lang
        );
      };
    }
  );
/* =====================================================
   INITIAL
===================================================== */
setDice(
  playerDice,
  5
);
setDice(
  botDice,
  5
);
