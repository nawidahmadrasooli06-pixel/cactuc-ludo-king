const tg = window.Telegram?.WebApp;

if(tg){
    tg.ready();
    tg.expand();
}

/* =========================
   BASIC
========================= */

const CHANNEL_URL = "https://t.me/CROOK_Cake";
const USERNAME = "@cactuc580";

const colors = ["red","yellow","green","blue"];
const colorNames = {
    red:"قرمز",
    yellow:"زرد",
    green:"سبز",
    blue:"آبی"
};

const diceFaces = ["⚀","⚁","⚂","⚃","⚄","⚅"];

/* =========================
   SCREEN
========================= */

const menu = document.getElementById("menu");
const roomScreen = document.getElementById("roomScreen");
const joinScreen = document.getElementById("joinScreen");
const gameScreen = document.getElementById("gameScreen");

function showScreen(screen){
    [menu,roomScreen,joinScreen,gameScreen]
        .forEach(x=>x.classList.add("hidden"));

    screen.classList.remove("hidden");
}

/* =========================
   TELEGRAM CHANNEL
========================= */

function openChannel(){
    if(tg && tg.openTelegramLink){
        tg.openTelegramLink(CHANNEL_URL);
    }else{
        window.open(CHANNEL_URL,"_blank");
    }
}

/* =========================
   MENU
========================= */

const channelButton = document.createElement("button");

channelButton.className = "menuBtn";
channelButton.textContent = "📢 کانال من";

channelButton.onclick = openChannel;

menu.insertBefore(
    channelButton,
    document.querySelector(".creator")
);

/* =========================
   ROOM
========================= */

let currentRoom = null;
let selectedPlayerCount = 2;

function createRoomCode(){
    return Math.floor(
        100000 + Math.random()*900000
    ).toString();
}

function createRoom(){

    currentRoom = createRoomCode();

    document.getElementById("roomCode")
        .textContent = currentRoom;

    renderRoomPlayers();

    showScreen(roomScreen);
}

function renderRoomPlayers(){

    const box =
        document.getElementById("roomPlayers");

    box.innerHTML = "";

    for(let i=0;i<selectedPlayerCount;i++){

        const div =
            document.createElement("div");

        div.className = "roomPlayer";

        if(i===0){

            div.textContent =
                "🔴 " + getPlayerName();

        }else{

            div.textContent =
                "⏳ در انتظار بازیکن...";
        }

        box.appendChild(div);
    }
}

/* PLAYER COUNT */

document.querySelectorAll(
    ".roomCount button"
).forEach(btn=>{

    btn.onclick = ()=>{

        selectedPlayerCount =
            Number(btn.dataset.count);

        document.querySelectorAll(
            ".roomCount button"
        ).forEach(x=>
            x.classList.remove("active")
        );

        btn.classList.add("active");

        renderRoomPlayers();
    };

});

document.querySelector(
    '.roomCount button[data-count="2"]'
).classList.add("active");

/* COPY */

document.getElementById(
    "copyCodeBtn"
).onclick = async ()=>{

    try{
        await navigator.clipboard.writeText(
            currentRoom
        );
    }catch{
        const input =
            document.createElement("input");

        input.value = currentRoom;

        document.body.appendChild(input);

        input.select();

        document.execCommand("copy");

        input.remove();
    }

    message("کد اتاق کپی شد ✓");
};

/* JOIN */

document.getElementById(
    "joinBtn"
).onclick = ()=>{

    const value =
        document.getElementById(
            "roomInput"
        ).value.trim();

    if(!/^\d{6}$/.test(value)){

        alert("کد باید ۶ رقمی باشد.");

        return;
    }

    currentRoom = value;

    startComputerGame();
};

/* =========================
   PLAYER
========================= */

function getPlayerName(){

    if(
        tg &&
        tg.initDataUnsafe &&
        tg.initDataUnsafe.user
    ){

        return (
            tg.initDataUnsafe.user.first_name
            || "Player"
        );
    }

    return "Player";
}

/* =========================
   LUDO ENGINE
========================= */

let players = [];
let currentPlayer = 0;
let rolled = false;
let currentRoll = 0;
let gameMode = "computer";
let gameStarted = false;
let rankings = [];

/*
   52 خانه اصلی
*/

const path = [

[6,1],[6,2],[6,3],[6,4],[6,5],
[5,6],[4,6],[3,6],[2,6],[1,6],
[0,6],[0,7],[0,8],
[1,8],[2,8],[3,8],[4,8],[5,8],
[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
[7,14],[8,14],
[8,13],[8,12],[8,11],[8,10],[8,9],
[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
[14,7],[14,6],
[13,6],[12,6],[11,6],[10,6],[9,6],
[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
[7,0],[6,0]

];

const starts = [0,13,26,39];

const safeSquares = new Set([
    0,8,13,21,26,34,39,47
]);

/*
   مسیر پایانی هر رنگ
*/

const lanes = {

    red:[
        [5,7],
        [4,7],
        [3,7],
        [2,7],
        [1,7],
        [0,7]
    ],

    yellow:[
        [7,9],
        [7,10],
        [7,11],
        [7,12],
        [7,13],
        [7,14]
    ],

    green:[
        [9,7],
        [10,7],
        [11,7],
        [12,7],
        [13,7],
        [14,7]
    ],

    blue:[
        [7,5],
        [7,4],
        [7,3],
        [7,2],
        [7,1],
        [7,0]
    ]

};

/* =========================
   RESET
========================= */

function resetGame(count=2){

    players = [];

    for(let i=0;i<count;i++){

        players.push({
            color:colors[i],
            pieces:[-1,-1,-1,-1],
            finished:0
        });
    }

    currentPlayer = 0;
    rolled = false;
    currentRoll = 0;
    rankings = [];
    gameStarted = true;
}

/*
 -1 = داخل خانه
 0..51 = مسیر
 52..57 = مسیر نهایی
*/

function positionOf(playerIndex,pieceIndex){

    const value =
        players[playerIndex]
        .pieces[pieceIndex];

    if(value < 0){
        return null;
    }

    if(value <= 51){

        const index =
            (starts[playerIndex] + value) % 52;

        return path[index];
    }

    const laneIndex =
        value - 52;

    const color =
        players[playerIndex].color;

    return lanes[color][laneIndex];
}

/* =========================
   BOARD
========================= */

function cell(row,col){

    return document.getElementById(
        "board"
    ).children[row*15+col];
}

function buildBoard(){

    const board =
        document.getElementById("board");

    board.innerHTML = "";

    for(let r=0;r<15;r++){

        for(let c=0;c<15;c++){

            const el =
                document.createElement("div");

            el.className="cell";

            /* HOME */

            if(r<=5 && c<=5)
                el.classList.add("home-red");

            else if(r<=5 && c>=9)
                el.classList.add("home-yellow");

            else if(r>=9 && c<=5)
                el.classList.add("home-green");

            else if(r>=9 && c>=9)
                el.classList.add("home-blue");

            board.appendChild(el);
        }
    }

    /*
      مسیر اصلی
    */

    path.forEach((p,index)=>{

        const el = cell(p[0],p[1]);

        el.className = "cell path";

        if(safeSquares.has(index))
            el.classList.add("safe");

        if(index===starts[0])
            el.classList.add("start-red");

        if(index===starts[1])
            el.classList.add("start-yellow");

        if(index===starts[2])
            el.classList.add("start-green");

        if(index===starts[3])
            el.classList.add("start-blue");

    });

    /*
      مسیرهای پایانی
    */

    Object.entries(lanes).forEach(
        ([color,coords])=>{

            coords.forEach(
                ([r,c])=>{

                    cell(r,c).className =
                        "cell lane-"+color;
                }
            );
        }
    );

    /*
      مرکز
    */

    for(let r=6;r<=8;r++){

        for(let c=6;c<=8;c++){

            cell(r,c).className =
                "cell center";
        }
    }

    /*
      خانه‌های شروع
    */

    createHomeSpots();
}

/* =========================
   HOME SPOTS
========================= */

function createHomeSpots(){

    const homes = {

        red:[1,1,1,4,4,1,4,4],

        yellow:[1,10,1,13,4,10,4,13],

        green:[10,1,10,4,13,1,13,4],

        blue:[10,10,10,13,13,10,13,13]

    };

    Object.entries(homes)
    .forEach(([color,data])=>{

        for(let i=0;i<4;i++){

            const r=data[i*2];
            const c=data[i*2+1];

            const spot =
                document.createElement("div");

            spot.className="homeInner";

            const inner =
                document.createElement("div");

            inner.className="homeSpot";

            spot.appendChild(inner);

            /*
              به شکل ساده خانه‌ها را
              در خود محدوده رنگی نشان می‌دهیم
            */

            cell(r,c).innerHTML="";
            cell(r,c).appendChild(spot);
        }
    });
}

/* =========================
   RENDER
========================= */

function render(){

    document.querySelectorAll(
        ".piece"
    ).forEach(x=>x.remove());

    players.forEach(
        (player,pi)=>{

            player.pieces.forEach(
                (value,mi)=>{

                    const pos =
                        positionOf(pi,mi);

                    if(!pos) return;

                    const el =
                        document.createElement("button");

                    el.className =
                        "piece "+player.color;

                    if(
                        pi===currentPlayer &&
                        rolled &&
                        canMove(
                            pi,
                            mi,
                            currentRoll
                        )
                    ){

                        el.classList.add(
                            "selectable"
                        );

                        el.onclick=()=>{

                            movePiece(pi,mi);
                        };
                    }

                    cell(
                        pos[0],
                        pos[1]
                    ).appendChild(el);
                }
            );
        }
    );

    renderPlayers();

    const current =
        players[currentPlayer];

    document.getElementById(
        "turnText"
    ).textContent =
        "نوبت "+colorNames[current.color];

    renderRankings();
}

/* =========================
   PLAYER CARDS
========================= */

function renderPlayers(){

    const panel =
        document.getElementById(
            "playersPanel"
        );

    panel.innerHTML="";

    players.forEach(
        (player,index)=>{

            const card =
                document.createElement("div");

            card.className="playerCard";

            if(index===currentPlayer)
                card.classList.add("active");

            const info =
                document.createElement("div");

            info.className="playerInfo";

            const name =
                document.createElement("div");

            name.className="playerColor";

            name.textContent =
                (index===0
                    ? "🔴 "
                    : index===1
                    ? "🟡 "
                    : index===2
                    ? "🟢 "
                    : "🔵 "
                )
                +colorNames[player.color];

            const status =
                document.createElement("div");

            status.className="playerStatus";

            status.textContent =
                player.finished+
                "/4 به پایان رسیده";

            info.appendChild(name);
            info.appendChild(status);

            const dice =
                document.createElement("button");

            dice.className="diceBtn";

            dice.innerHTML =
                diceFaces[
                    index===currentPlayer && rolled
                    ? currentRoll-1
                    : 0
                ]
                +
                "<small>تاس</small>";

            if(index===currentPlayer){

                dice.classList.add(
                    "yourTurn"
                );

                dice.onclick=rollDice;
            }else{

                dice.disabled=true;
                dice.style.opacity=".45";
            }

            card.appendChild(info);
            card.appendChild(dice);

            panel.appendChild(card);
        }
    );
}

/* =========================
   CAN MOVE
========================= */

function canMove(pi,mi,number){

    const value =
        players[pi].pieces[mi];

    if(value===57)
        return false;

    if(value===-1)
        return number===6;

    return value+number<=57;
}

/* =========================
   DICE
========================= */

function rollDice(){

    if(!gameStarted)
        return;

    if(currentPlayer!==0 && gameMode==="computer")
        return;

    if(rolled)
        return;

    currentRoll =
        Math.floor(Math.random()*6)+1;

    rolled=true;

    render();

    message(
        "تاس آمد: "+
        currentRoll+
        " 🎲"
    );

    const possible =
        players[currentPlayer]
        .pieces
        .some(
            (_,i)=>
                canMove(
                    currentPlayer,
                    i,
                    currentRoll
                )
        );

    if(!possible){

        message(
            "با این عدد حرکتی نداری."
        );

        setTimeout(()=>{

            if(currentRoll!==6)
                nextTurn();
            else{
                rolled=false;
                render();
            }

        },900);

        return;
    }

    /*
      کامپیوتر
    */

    if(
        gameMode==="computer" &&
        currentPlayer!==0
    ){

        setTimeout(
            computerMove,
            700
        );
    }
}

/* =========================
   MOVE PIECE
========================= */

async function movePiece(pi,mi){

    if(pi!==currentPlayer)
        return;

    if(!rolled)
        return;

    if(!canMove(pi,mi,currentRoll))
        return;

    const number=currentRoll;

    rolled=false;

    let value =
        players[pi].pieces[mi];

    /*
      خروج با ۶
    */

    if(value===-1){

        players[pi].pieces[mi]=0;

        message(
            "مهره از خانه خارج شد! 🎉"
        );

        render();

    }else{

        /*
          حرکت خانه به خانه
        */

        for(let i=0;i<number;i++){

            players[pi].pieces[mi]++;

            render();

            await wait(150);
        }

        message(
            "مهره حرکت کرد."
        );
    }

    /*
      پایان مهره
    */

    if(
        players[pi].pieces[mi]===57
    ){

        players[pi].finished++;

        message(
            "🎉 مهره به جام رسید!"
        );

        await wait(500);
    }

    capture(pi,mi);

    render();

    /*
      برنده
    */

    if(
        players[pi].finished===4
    ){

        if(!rankings.includes(pi))
            rankings.push(pi);

        message(
            "👑 "+
            colorNames[players[pi].color]+
            " کینگ شد!"
        );

        await wait(800);

        if(rankings.length===players.length){

            message(
                "🏆 بازی تمام شد!"
            );

            return;
        }
    }

    /*
      شش = دوباره
    */

    if(number===6){

        message(
            "🎲 شش آمد! دوباره تاس بزن."
        );

        render();

        return;
    }

    nextTurn();
}

/* =========================
   CAPTURE
========================= */

function capture(pi,mi){

    const value =
        players[pi].pieces[mi];

    if(value<0 || value>51)
        return;

    const position =
        (starts[pi]+value)%52;

    if(safeSquares.has(position))
        return;

    players.forEach(
        (opponent,oi)=>{

            if(oi===pi)
                return;

            opponent.pieces =
                opponent.pieces.map(
                    enemy=>{

                        if(
                            enemy>=0 &&
                            enemy<=51
                        ){

                            const enemyPos =
                                (starts[oi]+enemy)%52;

                            if(
                                enemyPos===position
                            ){

                                return -1;
                            }
                        }

                        return enemy;
                    }
                );
        }
    );
}

/* =========================
   NEXT TURN
========================= */

function nextTurn(){

    currentPlayer =
        (currentPlayer+1)
        %players.length;

    rolled=false;
    currentRoll=0;

    render();

    if(
        gameMode==="computer" &&
        currentPlayer!==0
    ){

        message(
            "🤖 نوبت کامپیوتر..."
        );

        setTimeout(
            rollDice,
            900
        );
    }else{

        message(
            "👉 نوبت تو — تاس را بزن"
        );
    }
}

/* =========================
   COMPUTER
========================= */

function computerMove(){

    const possible =
        players[currentPlayer]
        .pieces
        .map((_,i)=>i)
        .filter(
            i=>
                canMove(
                    currentPlayer,
                    i,
                    currentRoll
                )
        );

    if(!possible.length){

        nextTurn();
        return;
    }

    let chosen=possible[0];

    /*
      اول مهره‌ای که
      می‌تواند تمام شود
    */

    for(const i of possible){

        const value =
            players[currentPlayer]
            .pieces[i];

        const newValue =
            value===-1
            ?0
            :value+currentRoll;

        if(newValue===57){

            chosen=i;
            break;
        }
    }

    /*
      اگر شش باشد ترجیحاً
      مهره داخل خانه
    */

    if(currentRoll===6){

        const home =
            possible.find(
                i=>
                    players[currentPlayer]
                    .pieces[i]===-1
            );

        if(home!==undefined)
            chosen=home;
    }

    movePiece(
        currentPlayer,
        chosen
    );
}

/* =========================
   COMPUTER GAME
========================= */

function startComputerGame(){

    gameMode="computer";

    resetGame(2);

    buildBoard();

    render();

    showScreen(gameScreen);

    message(
        "🎮 تو قرمز هستی — تاس را بزن"
    );
}

/* =========================
   RANKINGS
========================= */

function renderRankings(){

    const box =
        document.getElementById(
            "rankText"
        );

    if(!rankings.length){

        box.textContent="";
        return;
    }

    box.innerHTML =
        rankings.map(
            (pi,index)=>
                "👑 "+
                (index+1)+
                " "+
                colorNames[
                    players[pi].color
                ]
        ).join("<br>");
}

/* =========================
   MESSAGE
========================= */

function message(text){

    document.getElementById(
        "gameMessage"
    ).textContent=text;
}

/* =========================
   WAIT
========================= */

function wait(ms){

    return new Promise(
        resolve=>
            setTimeout(resolve,ms)
    );
}

/* =========================
   BUTTONS
========================= */

document.getElementById(
    "computerBtn"
).onclick=startComputerGame;

document.getElementById(
    "createRoomBtn"
).onclick=createRoom;

document.getElementById(
    "joinRoomBtn"
).onclick=()=>{

    showScreen(joinScreen);
};

document.getElementById(
    "backBtn"
).onclick=()=>{

    showScreen(menu);
};

document.getElementById(
    "backJoinBtn"
).onclick=()=>{

    showScreen(menu);
};

document.getElementById(
    "startBtn"
).onclick=()=>{

    gameMode="local";

    resetGame(
        selectedPlayerCount
    );

    buildBoard();
    render();

    showScreen(gameScreen);

    message(
        "بازی شروع شد!"
    );
};

/* =========================
   SETTINGS
========================= */

document.getElementById(
    "settingsBtn"
).onclick=()=>{

    document.getElementById(
        "settings"
    ).classList.remove("hidden");
};

document.getElementById(
    "closeSettings"
).onclick=()=>{

    document.getElementById(
        "settings"
    ).classList.add("hidden");
};

/* =========================
   LANGUAGE PLACEHOLDER
========================= */

document.querySelectorAll(
    "[data-lang]"
).forEach(btn=>{

    btn.onclick=()=>{

        localStorage.setItem(
            "cactuc_language",
            btn.dataset.lang
        );

        document.getElementById(
            "settings"
        ).classList.add("hidden");

        message(
            "زبان انتخاب شد."
        );
    };
});

/* =========================
   START
========================= */

showScreen(menu);
