document.addEventListener("DOMContentLoaded", function () {
    const chessboard = document.getElementById("chessboard");
    const selectedPieceDisplay = document.getElementById("selected-piece");
    const currentPlayerDisplay = document.getElementById("current-player");

    let selectedPiece = null;
    let selectedIndex = null;
    let currentPlayer = 'A';
    
    let boardMatrix = [
        ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3'],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3']
    ];

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

    initializeBoard();

    function onCellClick(index) {
        const [row, col] = [Math.floor(index / 5), index % 5];
        const piece = boardMatrix[row][col];

        if (piece && piece.startsWith(currentPlayer)) {
            // Select the piece
            selectedPiece = piece;
            selectedIndex = index;
            selectedPieceDisplay.textContent = `Selected: ${piece}`;
            clearHighlights();
            highlightCell(index, 'selected');
            highlightPossibleMoves(index, piece);
        } else if (document.querySelector(`.chessboard div[data-index="${index}"]`).classList.contains('highlight')) {
            // Move the piece to the selected cell
            movePieceTo(index);
        }
    }

    
    function getStraightMoves(index, maxSteps) {
        const moves = [];
        const row = Math.floor(index / 5);
        const col = index % 5;
        const directions = [
            { dx: -1, dy: 0 }, // Left
            { dx: 1, dy: 0 },  // Right
            { dx: 0, dy: -1 }, // Up
            { dx: 0, dy: 1 }   // Down
        ];

        directions.forEach(({ dx, dy }) => {
            for (let step = 1; step <= maxSteps; step++) {
                const newRow = row + dy * step;
                const newCol = col + dx * step;
                if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
                    const newIndex = newRow * 5 + newCol;
                    const targetPiece = boardMatrix[newRow][newCol];
                    if (!targetPiece) {
                        moves.push(newIndex);
                    } else if (targetPiece.startsWith(currentPlayer === 'A' ? 'B' : 'A')) {
                        moves.push(newIndex);
                        break; // Stop after capturing
                    } else {
                        break; // Stop at friendly piece
                    }
                } else {
                    break; // Stop at board edge
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
            { dx: -1, dy: -1 }, // Top-left
            { dx: 1, dy: -1 },  // Top-right
            { dx: -1, dy: 1 },  // Bottom-left
            { dx: 1, dy: 1 }    // Bottom-right
        ];

        directions.forEach(({ dx, dy }) => {
            for (let step = 1; step <= maxSteps; step++) {
                const newRow = row + dy * step;
                const newCol = col + dx * step;
                if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
                    const newIndex = newRow * 5 + newCol;
                    const targetPiece = boardMatrix[newRow][newCol];
                    if (!targetPiece) {
                        moves.push(newIndex);
                    } else if (targetPiece.startsWith(currentPlayer === 'A' ? 'B' : 'A')) {
                        moves.push(newIndex);
                        break; // Stop after capturing
                    } else {
                        break; // Stop at friendly piece
                    }
                } else {
                    break; // Stop at board edge
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
        } else { // Pawn
            moves = getStraightMoves(index, 1);
        }

        moves.forEach(moveIndex => highlightCell(moveIndex, 'highlight'));
    }
    
    function movePieceTo(newIndex) {
        const targetCell = document.querySelector(`.chessboard div[data-index="${newIndex}"]`);

        if (targetCell && targetCell.classList.contains('highlight')) {
            const targetRow = Math.floor(newIndex / 5);
            const targetCol = newIndex % 5;
            const selectedRow = Math.floor(selectedIndex / 5);
            const selectedCol = selectedIndex % 5;

            // Capture logic
            const capturedPiece = boardMatrix[targetRow][targetCol];
            if (capturedPiece) {
                console.log(`${selectedPiece} captured ${capturedPiece}`);
                // You can add more logic here for handling captured pieces
            }

            // Move the piece in the matrix
            boardMatrix[targetRow][targetCol] = selectedPiece;
            boardMatrix[selectedRow][selectedCol] = null;

            // Clear selection and highlights
            selectedPiece = null;
            selectedIndex = null;
            selectedPieceDisplay.textContent = `Selected: None`;

            // Switch player
            currentPlayer = currentPlayer === 'A' ? 'B' : 'A';
            currentPlayerDisplay.textContent = `Current Player: ${currentPlayer}`;

            // Reinitialize the board with the new state
            initializeBoard();
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
});