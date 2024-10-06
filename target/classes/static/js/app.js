document.addEventListener("DOMContentLoaded", function () {

    let stompClient = null;
    let gameRoomId = localStorage.getItem('gameRoomId');
    let currentPlayer = localStorage.getItem('username');
    let boardMatrix = [
        ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-H3'],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-H3']
    ];
    let selectedPiece = null;
    let selectedIndex = null;
    let attackerId = localStorage.getItem('attacker_id');
    let defenderId =localStorage.getItem('defender_id');

    function connectWebSocket() {
        const socket = new SockJS('https://chess-9m89.onrender.com/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({},
        function (frame) {
            console.log('Connected: ' + frame);
            initializeGame();
        });
    }

    function initializeGame() {
        const urlParams = new URLSearchParams(window.location.search);
        gameRoomId = urlParams.get('roomId') || gameRoomId;
        console.log('Game Room ID:', gameRoomId);
        if (!gameRoomId) {
            alert('No game room ID provided');
            return;
        }

        stompClient.subscribe(`/topic/game/${gameRoomId}`, function(message) {
            console.log('Received game state:', message.body);
            const gameState = JSON.parse(message.body);
            updateGameState(gameState);
        });
        game_room = {
            id : gameRoomId
        }
        stompClient.send("/app/get_game_room", {}, JSON.stringify(game_room));

    }

    function updateGameState(gameState) {
        console.log('Updating game state with:', gameState);
        boardMatrix = gameState.current_game;
        updateMoveHistory(gameState.move_history)
        currentPlayer = gameState.current_id === gameState.attacker_id ? 'A' : 'B';
        initializeBoard();
        document.getElementById('current-player').textContent = `Current Player: ${currentPlayer}`;

        if (gameState.status === 'FINISHED') {
            const winner = gameState.winner === gameState.attacker_id ? 'Attacker' : 'Defender';
            alert(`Game Over! ${winner} wins!`);

        }
    }
    function adjustBoardForPlayer() {
        if (localStorage.getItem('username') === defenderId) {
            chessboard.classList.add('flip-board');
        } else {
            chessboard.classList.remove('flip-board');
        }

    }

    function initializeBoard() {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';
        adjustBoardForPlayer();
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

    function movePieceTo(newIndex) {
        const targetCell = document.querySelector(`.chessboard div[data-index="${newIndex}"]`);

        if (targetCell && targetCell.classList.contains('highlight')) {
            const targetRow = Math.floor(newIndex / 5);
            const targetCol = newIndex % 5;
            const selectedRow = Math.floor(selectedIndex / 5);
            const selectedCol = selectedIndex % 5;

            const move = {
                game_room_id: gameRoomId,
                piece_type: selectedPiece,
                attacker_id: currentPlayer === 'A' ? attackerId : defenderId,
                defender_id: currentPlayer === 'A' ? defenderId : attackerId,
                fromX: selectedRow,
                fromY: selectedCol,
                toX: targetRow,
                toY: targetCol
            };

            makeMove(move);

            selectedPiece = null;
            selectedIndex = null;
            document.getElementById('selected-piece').textContent = `Selected: None`;

            clearHighlights();
        }
    }

    function onCellClick(index) {
        const [row, col] = [Math.floor(index / 5), index % 5];
        const piece = boardMatrix[row][col];

        const isCurrentPlayerTurn = (currentPlayer === 'A' && localStorage.getItem('username') === attackerId) ||
                                    (currentPlayer === 'B' && localStorage.getItem('username') === defenderId);

        if (piece && piece.startsWith(currentPlayer) && isCurrentPlayerTurn) {
            selectedPiece = piece;
            selectedIndex = index;
            document.getElementById('selected-piece').textContent = `Selected: ${piece}`;
            clearHighlights();
            highlightCell(index, 'selected');
            highlightPossibleMoves(index, piece);
        } else if (document.querySelector(`.chessboard div[data-index="${index}"]`).classList.contains('highlight')) {
            movePieceTo(index);
        } else if (piece && !isCurrentPlayerTurn) {
            alert("It's not your turn!");
        } else if (piece && !piece.startsWith(currentPlayer)) {
            alert("You can't move your opponent's pieces!");
        }
    }
    function getKnightMoves(index) {
        const moves = [];
        const row = Math.floor(index / 5);
        const col = index % 5;
        const knightMoves = [
            { dx: -1, dy: -2 }, { dx: 1, dy: -2 },
            { dx: -2, dy: -1 }, { dx: 2, dy: -1 },
            { dx: -2, dy: 1 }, { dx: 2, dy: 1 },
            { dx: -1, dy: 2 }, { dx: 1, dy: 2 }
        ];

        knightMoves.forEach(({ dx, dy }) => {
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
   function getStraightMoves(index, maxSteps) {
       const moves = [];
       const row = Math.floor(index / 5);
       const col = index % 5;
       const directions = [
           { dx: -1, dy: 0 },
           { dx: 1, dy: 0 },
           { dx: 0, dy: -1 },
           { dx: 0, dy: 1 }
       ];

       directions.forEach(({ dx, dy }) => {
           for (let step = 1; step <= maxSteps; step++) {
               let newRow = row + dy * step;
               let newCol = col + dx * step;
               if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
                   const newIndex = newRow * 5 + newCol;
                   const targetPiece = boardMatrix[newRow][newCol];
                   if (!targetPiece || targetPiece.startsWith(currentPlayer === 'A' ? 'B' : 'A')) {
                       moves.push(newIndex);
                   }
                   if (targetPiece) break;
               }
           }
       });

       return moves;
   }

   function getDiagonalMoves(index, maxSteps) {
       const moves = [];
       const row = Math.floor(index / 5);
       const col = index % 5;
       const directions = [
           { dx: -1, dy: -1 },
           { dx: 1, dy: -1 },
           { dx: -1, dy: 1 },
           { dx: 1, dy: 1 }
       ];

       directions.forEach(({ dx, dy }) => {
           for (let step = 1; step <= maxSteps; step++) {
               let newRow = row + dy * step;
               let newCol = col + dx * step;
               if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
                   const newIndex = newRow * 5 + newCol;
                   const targetPiece = boardMatrix[newRow][newCol];
                   if (!targetPiece || targetPiece.startsWith(currentPlayer === 'A' ? 'B' : 'A')) {
                       moves.push(newIndex);
                   }
                   if (targetPiece) break;
               }
           }
       });

       return moves;
   }

   function highlightPossibleMoves(index, piece) {
       let moves = [];

       if (piece.endsWith('H1')) {
           moves = getStraightMoves(index, 2);
       } else if (piece.endsWith('H2')) {
           moves = getDiagonalMoves(index, 2);
       } else if (piece.endsWith('H3')) {
           moves = getKnightMoves(index);
       } else {
           moves = getPawnMoves(index);
       }

       moves.forEach(moveIndex => highlightCell(moveIndex, 'highlight'));
   }
    function getPawnMoves(index) {
        return getStraightMoves(index, 1);
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

    window.onload = function () {
        connectWebSocket();

        const urlParams = new URLSearchParams(window.location.search);
        const spectate = urlParams.get('spectate');

        if (spectate === 'true') {
            disableGameBoardInteractions();
        }
    };

    function disableGameBoardInteractions() {
        document.getElementById('game-board').classList.add('spectate-mode');
        console.log('Spectate mode activated: Board interactions disabled');
    }

    window.onbeforeunload = function() {
        if (stompClient !== null && currentUser !== null) {
            stompClient.send("/app/disconnect", {}, JSON.stringify(currentUser));
            notifyServerGameFinished();
        }
    };

    function notifyServerGameFinished() {
        const gameRoomId = localStorage.getItem('gameRoomId');
        if (gameRoomId) {
            const gameRoom = {
                id: gameRoomId
            };
            const url = 'https://chess-9m89.onrender.com/finish_game';
            const options = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameRoom)
            };

            if (navigator.sendBeacon) {
                const blob = new Blob([options.body], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
            } else {
                fetch(url, options).catch(error => {
                    console.error('Error finishing game on server:', error);
                });
            }
        }
    }

    function updateMoveHistory(moves) {
        const moveList = document.getElementById('move-list');
        moveList.innerHTML = '';

        moves.forEach(move => {
            const li = document.createElement('li');
            li.textContent = `${move.piece_type} moved from (${move.fromX}, ${move.fromY}) to (${move.toX}, ${move.toY})`;
                if (move.attacker_id === attacker_id) {w
                    li.classList.add('player-a-move');
                } else if (move.attacker_id === defender_id) {
                    li.classList.add('player-b-move');
                }
            moveList.appendChild(li);
        });
    }

});