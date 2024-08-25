package com.sid.chess.game;

import com.sid.chess.gameroom.GameRoom;
import com.sid.chess.gameroom.GameRoomRepository;
import com.sid.chess.gameroom.GameRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GameService {

    @Autowired
    private final GameRoomService service;

    @Autowired
    private final GameRoomRepository repository;

    public GameRoom save(GameMoves gameMoves) {
        var roomId = service.getGameRoomId(
                gameMoves.getAttackerId(),
                gameMoves.getDefenderId(),
                true
        ).orElseThrow();

        Optional<GameRoom> roomPre = repository.findById(roomId);
        if (roomPre.isPresent()) {
            GameRoom gameRoom = roomPre.get();

            if (!"ongoing".equals(gameRoom.getStatus())) {
                throw new IllegalStateException("Game is not ongoing.");
            }
            if (!gameMoves.getAttackerId().equals(gameRoom.getCurrentTurn())) {
                throw new IllegalArgumentException("It's not your turn.");
            }

            int[][] currentState = gameRoom.getGameRoomPiecesCurrentLocation();
            int[] move = gameMoves.getMove();
            int fromX = move[0];
            int fromY = move[1];
            int toX = move[2];
            int toY = move[3];

            if (isMoveWithinBounds(fromX, fromY, toX, toY)) {
                currentState[toX][toY] = currentState[fromX][fromY];
                currentState[fromX][fromY] = 0;
                gameRoom.setGameRoomPiecesCurrentLocation(currentState);
                gameRoom.setMoveCount(gameRoom.getMoveCount() + 1);
                if (isWinningConditionMet(currentState, gameMoves.getDefenderId())) {
                    gameRoom.setWinner(gameMoves.getAttackerId());
                    gameRoom.setStatus("finished");
                } else {
                    gameRoom.setCurrentTurn(gameMoves.getDefenderId());
                }
                repository.save(gameRoom);

                return gameRoom;
            } else {
                throw new IllegalArgumentException("Move is out of bounds.");
            }
        }

        throw new IllegalStateException("Game room not found.");
    }

    private boolean isMoveWithinBounds(int fromX, int fromY, int toX, int toY) {
        return (fromX >= 0 && fromX < 5) && (fromY >= 0 && fromY < 5) &&
                (toX >= 0 && toX < 5) && (toY >= 0 && toY < 5);
    }

    private boolean isWinningConditionMet(int[][] boardState, String defenderId) {
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (boardState[i][j] != 0 && isOpponentPiece(boardState[i][j], defenderId)) {
                    return false;
                }
            }
        }
        return true;
    }

    public Optional<GameRoom> getGameRoomById(String roomId){
        return repository.findGameRoomById(roomId);
    }

    private boolean isOpponentPiece(int piece, String defenderId) {
        return piece < 0;
    }
}