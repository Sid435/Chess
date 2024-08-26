package com.sid.chess.game;

import com.sid.chess.custom_exceptions.GameRoomCreationException;
import com.sid.chess.custom_exceptions.IllegalMoveException;
import com.sid.chess.custom_exceptions.InvalidGameStateException;
import com.sid.chess.gameroom.GameRoom;
import com.sid.chess.gameroom.GameRoomRepository;
import com.sid.chess.gameroom.GameRoomService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GameService {

    private static final Logger logger = LoggerFactory.getLogger(GameService.class);

    private final GameRoomService gameRoomService;
    private final GameRoomRepository repository;

    public GameRoom save(GameMoves gameMoves) {
        String roomId = getOrCreateGameRoom(gameMoves);
        GameRoom gameRoom = getAndValidateGameRoom(roomId, gameMoves);

        if (isValidMove(gameRoom, gameMoves)) {
            updateGameState(gameRoom, gameMoves);
            checkAndUpdateGameStatus(gameRoom, gameMoves);
            return repository.save(gameRoom);
        } else {
            throw new IllegalMoveException("Invalid move.");
        }
    }

    private String getOrCreateGameRoom(GameMoves gameMoves) {
        return gameRoomService.getGameRoomId(gameMoves.getAttackerId(), gameMoves.getDefenderId(), true)
                .orElseThrow(() -> new GameRoomCreationException("Failed to create or retrieve game room."));
    }

    private GameRoom getAndValidateGameRoom(String roomId, GameMoves gameMoves) {
        return repository.findById(roomId)
                .filter(room -> "ongoing".equals(room.getStatus()))
                .filter(room -> gameMoves.getAttackerId().equals(room.getCurrentTurn()))
                .orElseThrow(() -> new InvalidGameStateException("Invalid game state or not your turn."));
    }

    private boolean isValidMove(GameRoom gameRoom, GameMoves gameMoves) {
        Move move = gameMoves.getMove();
        return isMoveWithinBounds(move) && isPieceMovementValid(gameRoom, move);
    }

    private boolean isMoveWithinBounds(Move move) {
        return move.isWithinBounds(5, 5);  // Assuming 5x5 board
    }

    private boolean isPieceMovementValid(GameRoom gameRoom, Move move) {
        String[][] boardState = gameRoom.getGameRoomPiecesCurrentLocation();
        String piece = boardState[move.getFromX()][move.getFromY()];
        return piece != null && PieceMovementValidator.isValidMove(piece, move);
    }

    private void updateGameState(GameRoom gameRoom, GameMoves gameMoves) {
        Move move = gameMoves.getMove();
        String[][] currentState = gameRoom.getGameRoomPiecesCurrentLocation();
        currentState[move.getToX()][move.getToY()] = currentState[move.getFromX()][move.getFromY()];
        currentState[move.getFromX()][move.getFromY()] = null;
        gameRoom.setGameRoomPiecesCurrentLocation(currentState);
        gameRoom.setMoveCount(gameRoom.getMoveCount() + 1);
    }

    private void checkAndUpdateGameStatus(GameRoom gameRoom, GameMoves gameMoves) {
        if (isWinningConditionMet(gameRoom.getGameRoomPiecesCurrentLocation(), gameMoves.getDefenderId())) {
            gameRoom.setWinner(gameMoves.getAttackerId());
            gameRoom.setStatus("finished");
        } else {
            gameRoom.setCurrentTurn(gameMoves.getDefenderId());
        }
    }

    private boolean isWinningConditionMet(String[][] boardState, String defenderId) {
        for (String[] row : boardState) {
            for (String piece : row) {
                if (piece != null && isOpponentPiece(piece, defenderId)) {
                    return false;
                }
            }
        }
        return true;
    }

    public Optional<GameRoom> getGameRoomById(String roomId) {
        return repository.findById(roomId);
    }

    private boolean isOpponentPiece(String piece, String defenderId) {
        // Assuming defenderId pieces start with "B" and attackerId pieces start with "A"
        return (piece.startsWith("A") && defenderId.startsWith("B")) || (piece.startsWith("B") && defenderId.startsWith("A"));
    }
}