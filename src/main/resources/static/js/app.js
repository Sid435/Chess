let stompClient = null;
let gameRoomId =  localStorage.getItem('gameRoomId');
let currentPlayer = localStorage.getItem('username');
let boardMatrix = [
    ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3'],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3']
];
let selectedPiece = null;
let selectedIndex = null;

function connectWebSocket() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/game/' + gameRoomId, function (response) {
            const gameState = JSON.parse(response.body);
            updateGameState(gameState);
        });
    });
}

function initializeBoard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';
    boardMatrix.forEach((row, rowIndex) => {
        row.forEach((piece, colIndex) => {
            const index = rowIndex * 5 + colIndex;
            const cell = document.createElement("div");
            cell.setAttribute("data-index", index);
            cell.textContent = piece || '';
            if (piece) cell.classList.add(piece.startsWith('A') ? 'playerA' : 'playerB');
            cell.addEventListener("click", () => onCellClick(index));
            chessboard.appendChild(cell);
        });
    });
}

function makeMove(move) {
    stompClient.send("/app/move", {}, JSON.stringify(move));
}

function updateGameState(gameState) {
    boardMatrix = gameState.current_game;
    currentPlayer = gameState.current_id === gameState.attacker_id ? 'A' : 'B';
    initializeBoard();
    document.getElementById('current-player').textContent = `Current Player: ${currentPlayer}`;

    if (gameState.status === 'FINISHED') {
        const winner = gameState.winner === gameState.attacker_id ? 'Attacker' : 'Defender';
        alert(`Game Over! ${winner} wins!`);
    }
}

function onCellClick(index) {
    const [row, col] = [Math.floor(index / 5), index % 5];
    const piece = boardMatrix[row][col];

    if (piece && piece.startsWith(currentPlayer)) {
        selectedPiece = piece;
        selectedIndex = index;
        document.getElementById('selected-piece').textContent = `Selected: ${piece}`;
        clearHighlights();
        highlightCell(index, 'selected');
        highlightPossibleMoves(index, piece);
    } else if (document.querySelector(`.chessboard div[data-index="${index}"]`).classList.contains('highlight')) {
        movePieceTo(index);
    }
}

function getStraightMoves(index) {
    const moves = [];
    const row = Math.floor(index / 5);
    const col = index % 5;
    const directions = [
        { dx: -2, dy: 0 }, // Left
        { dx: 2, dy: 0 },  // Right
        { dx: 0, dy: -2 }, // Up
        { dx: 0, dy: 2 }   // Down
    ];

    directions.forEach(({ dx, dy }) => {
        const newRow = row + dy;
        const newCol = col + dx;
        if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
            const newIndex = newRow * 5 + newCol;
            const targetPiece = boardMatrix[newRow][newCol];
            if (!targetPiece || targetPiece.startsWith(currentPlayer === 'A' ? 'B' : 'A')) {
                moves.push(newIndex);
            }
        }
    });

    return moves;
}

function getDiagonalMoves(index) {
    const moves = [];
    const row = Math.floor(index / 5);
    const col = index % 5;
    const directions = [
        { dx: -2, dy: -2 }, // Top-left
        { dx: 2, dy: -2 },  // Top-right
        { dx: -2, dy: 2 },  // Bottom-left
        { dx: 2, dy: 2 }    // Bottom-right
    ];

    directions.forEach(({ dx, dy }) => {
        const newRow = row + dy;
        const newCol = col + dx;
        if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
            const newIndex = newRow * 5 + newCol;
            const targetPiece = boardMatrix[newRow][newCol];
            if (!targetPiece || targetPiece.startsWith(currentPlayer === 'A' ? 'B' : 'A')) {
                moves.push(newIndex);
            }
        }
    });

    return moves;
}

function highlightPossibleMoves(index, piece) {
    let moves = [];

    if (piece.endsWith('H1')) {
        moves = getStraightMoves(index);
    } else if (piece.endsWith('H2')) {
        moves = getDiagonalMoves(index);
    } else { // Pawn
        moves = getStraightMoves(index).filter(moveIndex => {
            const moveDistance = Math.abs(moveIndex - index);
            return moveDistance === 1 || moveDistance === 5; // Pawns can move one step in straight directions
        });
    }

    moves.forEach(moveIndex => highlightCell(moveIndex, 'highlight'));
}

function movePieceTo(newIndex) {
    const targetRow = Math.floor(newIndex / 5);
    const targetCol = newIndex % 5;
    const selectedRow = Math.floor(selectedIndex / 5);
    const selectedCol = selectedIndex % 5;

    // Capture logic
    const capturedPiece = boardMatrix[targetRow][targetCol];
    if (capturedPiece) {
        console.log(`${selectedPiece} captured ${capturedPiece}`);
    }

    // Move the piece in the matrix
    boardMatrix[targetRow][targetCol] = selectedPiece;
    boardMatrix[selectedRow][selectedCol] = null;

    // Clear selection and highlights
    selectedPiece = null;
    selectedIndex = null;
    document.getElementById('selected-piece').textContent = `Selected: None`;

    // Switch player
    currentPlayer = currentPlayer === 'A' ? 'B' : 'A';
    document.getElementById('current-player').textContent = `Current Player: ${currentPlayer}`;

    // Reinitialize the board with the new state
    initializeBoard();
}

function clearHighlights() {
    document.querySelectorAll('.chessboard div').forEach(div => {
        div.classList.remove('selected', 'highlight');
    });
}

function highlightCell(index, className) {
    const cell = document.querySelector(`.chessboard div[data-index="${index}"]`);
    if (cell) cell.classList.add(className);
}

window.onload = connectWebSocket;