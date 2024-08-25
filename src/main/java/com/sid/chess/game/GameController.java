package com.sid.chess.game;

import com.sid.chess.gameroom.GameRoom;
import com.sid.chess.gameroom.GameRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;
    private final GameRoomService gameRoomService;

    @MessageMapping("/move")
    @SendTo("/topic/game")
    public GameRoom makeMove(GameMoves gameMoves) {
        try {
            return gameService.save(gameMoves);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Bad request: " + e.getMessage());
        } catch (IllegalStateException e) {
            throw new RuntimeException("Conflict: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Internal server error: " + e.getMessage());
        }
    }

    @MessageMapping("/getGameRoom")
    @SendTo("/topic/gameRoom")
    public GameRoom getGameRoom(String roomId) {
        Optional<GameRoom> gameRoom = gameService.getGameRoomById(roomId);
        return gameRoom.orElseThrow(() -> new RuntimeException("Game room not found"));
    }

    @MessageMapping("/createGameRoom")
    @SendTo("/topic/newGameRoom")
    public GameRoom createGameRoom(GameRoom newGameRoom) {
        try {
            var gameId = gameRoomService.createGameId(newGameRoom.getAttackerId(), newGameRoom.getDefenderId());
            Optional<GameRoom> createdGameRoom = gameService.getGameRoomById(gameId);
            return createdGameRoom.orElseThrow(() -> new RuntimeException("Failed to create game room"));
        } catch (Exception e) {
            throw new RuntimeException("Internal server error: " + e.getMessage());
        }
    }

    @MessageMapping("/checkGameStatus")
    @SendTo("/topic/gameStatus")
    public String checkGameStatus(String roomId) {
        Optional<GameRoom> gameRoom = gameService.getGameRoomById(roomId);
        if (gameRoom.isPresent()) {
            GameRoom room = gameRoom.get();
            if ("finished".equals(room.getStatus())) {
                return "Winner: " + room.getWinner();
            } else {
                return "Game is ongoing.";
            }
        } else {
            throw new RuntimeException("Game room not found");
        }
    }
}