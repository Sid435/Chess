document.addEventListener("DOMContentLoaded", function () {
    const chessboard = document.getElementById("chessboard");
    const selectedPieceDisplay = document.getElementById("selected-piece");
    const currentPlayerDisplay = document.getElementById("current-player");

    let selectedPiece = null;
    let selectedIndex = null;
    let currentPlayer = 'A'; // A or B based on the player
    let boardMatrix = []; // Represents the board state
    let gameId = null; // Unique game identifier
    let playerId = null; // Unique player identifier
    let stompClient = null;

    // Connect to WebSocket and establish STOMP client
    function connect() {
        const socket = new SockJS('http://localhost:8080/ws'); // WebSocket endpoint
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            handleGameSetup();
        });
    }

    // Determine if a game should be created or joined
    function handleGameSetup() {
        stompClient.send("/app/checkGameRoom", {}, {});
        stompClient.subscribe('/topic/checkGameRoomResponse', function (response) {
            const message = JSON.parse(response.body);
            if (message.gameExists) {
                // Join existing game
                gameId = message.gameId;
                playerId = message.playerId;
                subscribeToGameRoom();
            } else {
                // Create new game
                createGame();
            }
        });
    }

    // Create a new game if no existing game is found
    function createGame() {
        stompClient.send("/app/createGameRoom", {}, JSON.stringify({}));
        stompClient.subscribe('/topic/createGameRoomResponse', function (response) {
            const message = JSON.parse(response.body);
            gameId = message.gameId;
            playerId = message.playerId;
            subscribeToGameRoom();
        });
    }

    // Subscribe to game room updates
    function subscribeToGameRoom() {
        stompClient.subscribe('/topic/game/' + gameId, function (message) {
            const gameRoom = JSON.parse(message.body);
            updateGameState(gameRoom);
        });
    }

    // Update the game state based on the server response
    function updateGameState(gameRoom) {
        boardMatrix = gameRoom.gameRoomPiecesCurrentLocation;
        currentPlayer = gameRoom.currentTurn === gameRoom.attackerId ? 'A' : 'B';
        currentPlayerDisplay.textContent = `Current Player: ${currentPlayer}`;
        initializeBoard();
    }

    // Initialize the board UI
    function initializeBoard() {
        chessboard.innerHTML = ''; // Clear previous board
        boardMatrix.forEach((row, rowIndex) => {
            row.forEach((piece, colIndex) => {
                const index = rowIndex * 5 + colIndex;
                const cell = document.createElement("div");
                cell.setAttribute("data-index", index);
                cell.textContent = piece || ''; // Display piece or empty
                if (piece) cell.classList.add(piece.startsWith('A') ? 'playerA' : 'playerB');
                cell.addEventListener("click", () => onCellClick(index));
                chessboard.appendChild(cell);
            });
        });
    }

    // Handle clicks on board cells
    function onCellClick(index) {
        const [row, col] = [Math.floor(index / 5), index % 5];
        const piece = boardMatrix[row][col];

        if (piece && piece.startsWith(currentPlayer)) {
            // Selecting a piece
            selectedPiece = piece;
            selectedIndex = index;
            selectedPieceDisplay.textContent = `Selected: ${piece}`;
            clearHighlights();
            highlightCell(index, 'selected');
            highlightPossibleMoves(index, piece);
        } else if (document.querySelector(`.chessboard div[data-index="${index}"]`).classList.contains('highlight')) {
            // Moving a piece
            movePieceTo(index);
        }
    }

    // Move a piece to a new location
    function movePieceTo(newIndex) {
        if (stompClient) {
            const move = {
                gameId: gameId,
                from: selectedIndex,
                to: newIndex,
                playerId: playerId
            };
            stompClient.send("/app/move", {}, JSON.stringify(move));
        }
    }

    // Clear all highlights on the board
    function clearHighlights() {
        document.querySelectorAll('.chessboard div').forEach(div => {
            div.classList.remove('selected', 'highlight');
        });
    }

    // Highlight a specific cell on the board
    function highlightCell(index, className) {
        const cell = document.querySelector(`.chessboard div[data-index="${index}"]`);
        if (cell) cell.classList.add(className);
    }

    connect(); // Start the WebSocket connection when the page loads
});