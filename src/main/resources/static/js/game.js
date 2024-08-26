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

    function connect() {
        const socket = new SockJS('http://localhost:8080/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            handleGameSetup();
        });
    }

    function handleGameSetup() {
        stompClient.send("/app/checkGameRoom", {}, {});
        stompClient.subscribe('/topic/checkGameRoomResponse', function (response) {
            const message = JSON.parse(response.body);
            if (message.gameExists) {
                gameId = message.gameId;
                playerId = message.playerId;
                subscribeToGameRoom();
            } else {
                createGame();
            }
        });
    }

    function createGame() {
        stompClient.send("/app/createGameRoom", {}, JSON.stringify({}));
        stompClient.subscribe('/topic/createGameRoomResponse', function (response) {
            const message = JSON.parse(response.body);
            gameId = message.gameId;
            playerId = message.playerId;
            subscribeToGameRoom();
        });
    }

    function subscribeToGameRoom() {
        stompClient.subscribe('/topic/game/' + gameId + '/start', function(message) {
            const gameData = JSON.parse(message.body);
            initializeGame(gameData);
        });

        stompClient.subscribe('/topic/game/' + gameId, function (message) {
            const gameRoom = JSON.parse(message.body);
            updateGameState(gameRoom);
        });
    }

    function initializeGame(gameData) {
        boardMatrix = gameData.initialBoard;
        currentPlayer = gameData.startingPlayer;
        playerId = gameData.playerId;
        initializeBoard();
    }

    function updateGameState(gameRoom) {
        boardMatrix = gameRoom.gameRoomPiecesCurrentLocation;
        currentPlayer = gameRoom.currentTurn === gameRoom.attackerId ? 'A' : 'B';
        currentPlayerDisplay.textContent = `Current Player: ${currentPlayer}`;
        initializeBoard();
    }

    function initializeBoard() {
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

    function onCellClick(index) {
        const [row, col] = [Math.floor(index / 5), index % 5];
        const piece = boardMatrix[row][col];

        if (piece && piece.startsWith(currentPlayer)) {
            selectedPiece = piece;
            selectedIndex = index;
            selectedPieceDisplay.textContent = `Selected: ${piece}`;
            clearHighlights();
            highlightCell(index, 'selected');
            highlightPossibleMoves(index, piece);
        } else if (document.querySelector(`.chessboard div[data-index="${index}"]`).classList.contains('highlight')) {
            movePieceTo(index);
        }
    }

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

    function clearHighlights() {
        document.querySelectorAll('.chessboard div').forEach(div => {
            div.classList.remove('selected', 'highlight');
        });
    }

    function highlightCell(index, className) {
        const cell = document.querySelector(`.chessboard div[data-index="${index}"]`);
        if (cell) cell.classList.add(className);
    }

    function highlightPossibleMoves(index, piece) {
        // Implement logic to highlight possible moves based on piece type
        // This is a placeholder and needs to be implemented based on your game rules
        console.log("Highlighting possible moves for", piece, "at index", index);
    }

    connect();
});