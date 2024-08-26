let stompClient = null;
let gameRoom = null;
let currentPlayer = null;

function connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        initializeGame();
    });
}

function initializeGame() {
    const gameInfo = JSON.parse(localStorage.getItem('gameInfo'));
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    fetch(`/create_game_room?attackerId=${gameInfo.attackerId}&defenderId=${gameInfo.defenderId}`)
        .then(response => response.json())
        .then(room => {
            gameRoom = room;
            stompClient.subscribe(`/topic/game/${room.id}`, function (gameState) {
                updateGameBoard(JSON.parse(gameState.body));
            });
            updateGameBoard(room);
        })
        .catch(error => console.error('Error creating game room:', error));
}

function updateGameBoard(room) {
    gameRoom = room;
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    room.current_game.forEach((row, x) => {
        row.forEach((cell, y) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.textContent = cell || '';
            cellElement.addEventListener('click', () => selectPiece(x, y));
            board.appendChild(cellElement);
        });
    });
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('current-player').textContent = `Current Player: ${room.current_id === currentUser.id ? 'You' : 'Opponent'}`;
}

function selectPiece(x, y) {
    // Implement piece selection logic
    console.log(`Selected piece at (${x}, ${y})`);
}

function makeMove(direction) {
    // Implement move logic based on selected piece and direction
    console.log(`Move ${direction}`);
    // Send move to server using stompClient.send("/app/move", ...)
}

connect();

// Add event listeners for move buttons
document.getElementById('move-left').addEventListener('click', () => makeMove('L'));
document.getElementById('move-right').addEventListener('click', () => makeMove('R'));
document.getElementById('move-forward').addEventListener('click', () => makeMove('F'));
document.getElementById('move-backward').addEventListener('click', () => makeMove('B'));