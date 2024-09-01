package com.sid.chess.gameroom.service;


import com.sid.chess.custom_exceptions.GameRoomNotFoundException;
import com.sid.chess.custom_exceptions.IllegalMoveException;
import com.sid.chess.gameroom.model.GameRoom;
import com.sid.chess.gameroom.model.GameStatus;
import com.sid.chess.gameroom.model.Move;
import com.sid.chess.gameroom.repository.GameRoomRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class GameRoomService {

    private final GameRoomRepository gameRoomRepository;

    public GameRoom processMove(Move move){
        GameRoom gameRoom = gameRoomRepository.findByGameRoomId(move.getGame_room_id()).orElseThrow(
                () -> new GameRoomNotFoundException("Game not found!")
        );
        if(isValidMove(move.getPiece_type(), move)){
            updateGame(move, gameRoom);
            checkGameStatus(gameRoom);

            return gameRoomRepository.save(gameRoom);
        }else{
            throw new IllegalMoveException("Move not valid!");
        }
    }

    private void checkGameStatus(GameRoom gameRoom) {
        String[][] board = gameRoom.getCurrent_game();
        boolean attackerHasPieces = false;
        boolean defenderHasPieces = false;

        for (String[] row : board) {
            for (String piece : row) {
                if (piece != null) {
                    if (piece.startsWith("A")) attackerHasPieces = true;
                    if (piece.startsWith("B")) defenderHasPieces = true;
                }
            }
        }

        if (!attackerHasPieces) {
            gameRoom.setStatus(GameStatus.FINISHED);
            gameRoom.setWinner(gameRoom.getDefender_id());
            gameRoomRepository.delete(gameRoom);
        } else if (!defenderHasPieces) {
            gameRoom.setStatus(GameStatus.FINISHED);
            gameRoom.setWinner(gameRoom.getAttacker_id());
            gameRoomRepository.delete(gameRoom);
        }
    }

    private static void updateGame(Move move, GameRoom gameRoom) {
        List<Move> move_history = gameRoom.getMove_history();
        move_history.add(move);
        gameRoom.setMove_history(new ArrayList<>(move_history));

        String[][] curr = gameRoom.getCurrent_game();
        curr[move.getToX()][move.getToY()] = curr[move.getFromX()][move.getFromY()];
        curr[move.getFromX()][move.getFromY()] = null;

        String opp_id = gameRoom.getCurrent_id().equals(gameRoom.getAttacker_id()) ? gameRoom.getDefender_id() : gameRoom.getAttacker_id();
        gameRoom.setCurrent_id(opp_id);
    }

    public static boolean isValidMove(String piece, Move move) {
        if (piece.toLowerCase().contains("p")) {
            return isPawnMove(move);
        } else if (piece.toLowerCase().endsWith("h1")) {
            return isHero1Move(move);
        } else if (piece.toLowerCase().endsWith("h2")) {
            return isHero2Move(move);
        } else if (piece.toLowerCase().endsWith("h3")) {
            return isHero3Move(move);
        } else {
            return false;
        }
    }

    private static boolean isHero1Move(Move move) {
        int dx = Math.abs(move.getToX() - move.getFromX());
        int dy = Math.abs(move.getToY() - move.getFromY());
        return (dx == 0 && (dy == 1 || dy == 2)) || (dy == 0 && (dx == 1 || dx == 2));
    }

    private static boolean isHero2Move(Move move) {
        int dx = Math.abs(move.getToX() - move.getFromX());
        int dy = Math.abs(move.getToY() - move.getFromY());
        return dx == dy && (dx == 1 || dx == 2);
    }

    private static boolean isPawnMove(Move move) {
        int dx = Math.abs(move.getToX() - move.getFromX());
        int dy = Math.abs(move.getToY() - move.getFromY());
        return dx + dy == 1;
    }



    private static boolean isHero3Move(Move move) {
        int dx = Math.abs(move.getToX() - move.getFromX());
        int dy = Math.abs(move.getToY() - move.getFromY());
        return (dx == 1 && dy == 2) || (dx == 2 && dy == 1);
    }
    public GameRoom getGameRoom(
            String attackerId,
            String defenderId,
            boolean createGameRoomIfNotExists
    ){
        Optional<GameRoom> gameRoom = gameRoomRepository.findByAttackerIdAndDefenderId(attackerId, defenderId);
        if(gameRoom.isPresent()){
            return gameRoom.get();
        }
        else{
            if(createGameRoomIfNotExists){
                return createGameRoom(attackerId, defenderId);
            }else throw new GameRoomNotFoundException("GameRoom doesn't exists");
        }
    }

    public GameRoom createGameRoom(String attackerId, String defenderId) {
        var gameId = String.format("%s_%s", attackerId, defenderId);

        GameRoom gameRoom = GameRoom.builder()
                .id(gameId)
                .attacker_id(attackerId)
                .defender_id(defenderId)
                .current_id(attackerId)
                .status(GameStatus.ONGOING)
                .build();
        gameRoomRepository.save(gameRoom);
        return gameRoom;
    }

    public void finishGame(String room_id){
        Optional<GameRoom> gameRoom = gameRoomRepository.findById(room_id);
        gameRoom.ifPresent(room -> {
            room.setStatus(GameStatus.FINISHED);
            gameRoomRepository.delete(room);
        });
    }

    public GameRoom getGameRoomById(String attackerId, String defenderId, boolean b) {
        return gameRoomRepository.findByAttackerIdAndDefenderId(attackerId, defenderId)
                .orElse(gameRoomRepository.findByAttackerIdAndDefenderId(defenderId, attackerId).orElseThrow(() -> new GameRoomNotFoundException("Game doesn't exists")));
    }

    public GameRoom getGameRoomById(String room_id) {
        return gameRoomRepository.findByGameRoomId(room_id)
                .orElseThrow(
                        () -> new GameRoomNotFoundException("Room doesn't existing!")
                );
    }

    public List<GameRoom> findGameByStatus(GameStatus gameStatus) {
        return gameRoomRepository.getGameByStatus("ONGOING");
    }
}
