const firebaseConfig = {

    apiKey: "AIzaSyCmrKJzuZ2Nbe8wCGY4Do6Nbu69vMXR6so",

    authDomain: "kevatpe1715-haamupeli.firebaseapp.com",

    projectId: "kevatpe1715-haamupeli",

    storageBucket: "kevatpe1715-haamupeli.firebasestorage.app",

    messagingSenderId: "656257362151",

    appId: "1:656257362151:web:1fe3ca51b722fd83fbda42"

  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const BOARD_SIZE = 20;
const cellSize = calculateCellSize();
let board;
let player;
let ghosts = [];
let ghostSpeed = 1000;
let isGameRunning = false;
let ghostInterval;
let score = 0;
let ghostAmount = 1;

document.getElementById('new-game-btn').addEventListener('click', startGame);
document.getElementById('save-scores-btn').addEventListener('click', saveScore);
document.getElementById('exit-btn').addEventListener('click', exitGame);


document.addEventListener('keydown',(event)=>{
    if(isGameRunning === false){
        return;
    }

    switch(event.key){
        case 'ArrowUp':
            player.move(0,-1);
        break;

        case 'ArrowDown':
            player.move(0,1);
        break;

        case 'ArrowLeft':
            player.move(-1,0);
        break;

        case 'ArrowRight':
            player.move(1,0);
        break

        case 'w':
            shootAt(player.x,player.y -1);
        break;

        case 's':
            shootAt(player.x, player.y +1);
        break;

        case 'a':
            shootAt(player.x -1, player.y);
        break;

        case 'd':
            shootAt(player.x + 1, player.y);
        break;
    }
    event.preventDefault();
});

function startGame(){
    //console.log('klikattu'); 
    document.getElementById('intro-screen').style.display ='none';
    document.getElementById('game-screen').style.display = 'block';

    player = new Player(0,0);

    board = generateRandomBoard();
    drawBoard(board);
    setTimeout(()=>{
        ghostInterval = setInterval(moveGhosts,ghostSpeed);
    },1000);
    score = 0;
    updateScoreBoard(0);
    isGameRunning = true;
}

function generateRandomBoard(){
    
    const newBoard = Array.from({length:BOARD_SIZE},()=>Array(BOARD_SIZE).fill(''));
    for(let y = 0; y < BOARD_SIZE; y++){
        for(let x = 0; x < BOARD_SIZE; x++){
           if(y === 0 || y === BOARD_SIZE -1 || x === 0|| x === BOARD_SIZE - 1){
            newBoard[y][x] = 'W'; 
           } 
        }
    }

    generateObstacles(newBoard);
    //pelaajan sijainnin laittaminen
    const [playerX, playerY] = randomEmptyPosition(newBoard);
    setCell(newBoard, playerX, playerY, 'P');

    player.x = playerX;
    player.y = playerY;

    //Kummitusten luonti
    ghosts = [];
    for(let i = 0; i < ghostAmount; i++){
        const[ghostX, ghostY] = randomEmptyPosition(newBoard);
        setCell(newBoard,ghostX, ghostY,'G');
        ghosts.push(new Ghost(ghostX, ghostY));
    }

    console.log(newBoard);
    return newBoard;
}

function drawBoard(board){
    const gameBoard = document.getElementById('game-board');
    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE},1fr)`;

    gameBoard.innerHTML = "";

    for( let y = 0; y < BOARD_SIZE; y++){
        for(let x = 0; x < BOARD_SIZE; x++){
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.width = cellSize +'px';
            cell.style.height = cellSize + 'px';
            if(getCell(board,x,y)=== 'W'){
                cell.classList.add('wall');
            }else if(getCell(board,x,y) === 'P'){
                cell.classList.add('player');
            }else if(getCell(board,x,y) === 'G'){
                cell.classList.add('ghost');
            }else if(getCell(board,x,y) === 'B'){
                cell.classList.add('bullet');
                setTimeout(()=>{
                    setCell(board,x,y,'');
                    //drawBoard(board);
                }, 400);
            }

            gameBoard.appendChild(cell);
        }
    }
}

function getCell(board, x, y){
    return board[y][x];
}

function calculateCellSize(){
    const screenSize = Math.min(window.innerWidth, window.innerHeight);
    const gameBoardSize = 0.95 * screenSize;
    return gameBoardSize / BOARD_SIZE;
}

function generateObstacles(board){
    const obstacles =[
        [[0,0],[0,1],[1,0],[1,1]], //Neliö
        [[0,0],[0,1],[0,2],[0,3]],//I
        [[0,0],[1,0],[2,0],[1,1]], //T
        [[1,0],[2,0],[1,1],[0,2],[1,2]], //Z
        [[1,0],[2,0],[0,1],[1,1]],//S
    ]

    const positions = [
        {startX: 2, startY: 2},
        {startX: 8, startY: 2},
        {startX: 4, startY: 8},
        {startX: 3, startY: 16},
        {startX: 10, startY: 10},
        {startX: 12, startY: 10},
        {startX: 16, startY: 10},
    ]

    positions.forEach(pos=>{
        const randomObstacle = obstacles[Math.floor(Math.random() * obstacles.length)];
        placeObstacle(board,randomObstacle,pos.startX,pos.startY);
    });
}

function placeObstacle(board, obstacle, startX, startY){
    for(coordinatePair of obstacle){
        [x,y] = coordinatePair;
        board[startY + y][startX + x] ='W';
    }
}

function randomInt(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomEmptyPosition(board){
    x = randomInt(1,BOARD_SIZE - 2);
    y = randomInt(1, BOARD_SIZE -2);
    if(getCell(board,x,y) === ''){
        return [x,y];
    }else{
        return randomEmptyPosition(board);
    }
}

function setCell(board, x, y, value){
    board[y][x] = value;
}

function shootAt(x,y){
    if(getCell(board, x,y) === 'W'){
        return;
    }

    const ghostIndex = ghosts.findIndex(ghost => ghost.x === x && ghost.y === y);
    if(ghostIndex !== -1){
        ghosts.splice(ghostIndex,1);
        updateScoreBoard(50);
    }
    setCell(board,x,y,'B');
    drawBoard(board);

    if(ghosts.length === 0){
       startNextLevel();
    }
}

function moveGhosts(){
    const oldGhosts = ghosts.map(ghost =>({x:ghost.x, y: ghost.y}));

    ghosts.forEach(ghost =>{
      const newPosition = ghost.moveGhostTowardsPlayer(player,board, oldGhosts);
      ghost.x = newPosition.x;
      ghost.y = newPosition.y;
      
      setCell(board, ghost.x, ghost.y,'G'); 

      oldGhosts.forEach(ghost =>{
        setCell(board,ghost.x, ghost.y,'');
      })
      
      ghosts.forEach(ghost =>{
        setCell(board,ghost.x, ghost.y, 'G');
      })

      drawBoard(board);

      if(ghost.x === player.x && ghost.y === player.y){
        endGame();
        return;
      }

    });
}

function endGame(){
    alert('Game Over! The ghost caught you!');
    // document.getElementById('intro-screen').style.display = 'block';
    // document.getElementById('game-screen').style.display = 'none';
    clearInterval(ghostInterval);
    isGameRunning = false;
    document.getElementById('game-over-screen').style.display = 'block';
}

function updateScoreBoard(points){
    const scoreBoard = document.getElementById('score-board');
    score += points;
    scoreBoard.textContent = `Pisteet: ${score}`;
}

function startNextLevel(){
    alert('Level up! Haamujen nopeus kasvaa');
    ghostAmount ++;
    board = generateRandomBoard();
    ghostSpeed *= 0.9;
    clearInterval(ghostInterval);
    setTimeout(()=>{
        ghostInterval =  setInterval(moveGhosts,ghostSpeed);
    },1000); 
}

function saveScore()
{
    const playerName = document.getElementById('player-name').value;
    if(playerName.trim() === ''){
        alert('Please enter your name');
        return;
    }

    db.collection("scores").add({
        name:playerName,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    exitGame();
}

function exitGame(){
    document.getElementById('intro-screen').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
}

class Player{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    move(deltaX, deltaY){
        //otetaan talteen tämän hetkinen sijainti
        const currentX = player.x;
        const currentY = player.y;

        //Seuraava sijainti
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;

        if(getCell(board, newX, newY) === ''){
                    //Annetaan uusi sijainti pelaajalle
        player.x = newX;
        player.y = newY;

        setCell(board, currentX, currentY,'');
        setCell(board,newX,newY,'P');

        //päivitetään pelilauta
        drawBoard(board);
        }
    }
}


class Ghost{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    moveGhostTowardsPlayer(player, board, oldGhosts){
        
        let dx = player.x - this.x;
        let dy = player.y - this.y;

        let moves = [];

        if(Math.abs(dx) > Math.abs(dy)){
            //Vaakatossa liikkuminen
            if(dx > 0) moves.push({x: this.x + 1, y:this.y}) //liikutaan oikealle
            else moves.push({x:this.x - 1, y: this.y}); // liikutaan vasemmalle

            //Pystyssä liikkuminen
            if(dy > 0) moves.push({x: this.x, y: this.y + 1}) // liikutaan alaspäin
            else moves.push({x: this.x, y: this.y - 1}) // liikutaan ylöspäin
        }else{
            //Pystyssä liikkuminen
            if(dy > 0) moves.push({x: this.x, y: this.y + 1}) // liikutaan alaspäin
            else moves.push({x: this.x, y: this.y - 1}) // liikutaan ylöspäin

            //Vaakatossa liikkuminen
            if(dx > 0) moves.push({x: this.x + 1, y:this.y}) //liikutaan oikealle
            else moves.push({x:this.x - 1, y: this.y}); // liikutaan vasemmalle
        }

        for(let move of moves){
            if(getCell(board,move.x, move.y) === '' || getCell(board, move.x, move.y) === 'P' &&
        !oldGhosts.some(h=>h.x === move.x && h.y === move.y)){
                return move;
            }
        }

        return{x:this.x, y:this.y};
    }
}