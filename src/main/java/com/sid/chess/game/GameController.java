package com.sid.chess.game;

import com.sid.chess.custom_exceptions.GameRoomCreationException;
import com.sid.chess.custom_exceptions.GameRoomNotFoundException;
import com.sid.chess.gameroom.GameRoom;
import com.sid.chess.gameroom.GameRoomRepository;
import com.sid.chess.gameroom.GameRoomService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class GameController {

    private static final Logger logger = LoggerFactory.getLogger(GameController.class);

    private final GameService gameService;
    private final GameRoomService gameRoomService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/move")
    public void makeMove(GameMoves gameMoves) {
        logger.info("Received move: {}", gameMoves);
        GameRoom updatedRoom = gameService.save(gameMoves);
        messagingTemplate.convertAndSend("/topic/game/" + updatedRoom.getGameId(), updatedRoom);
    }

    @MessageMapping("/getGameRoom")
    public void getGameRoom(String roomId) {
        logger.info("Fetching game room: {}", roomId);
        GameRoom gameRoom = gameService.getGameRoomById(roomId)
                .orElseThrow(() -> new GameRoomNotFoundException("Game room not found"));
        messagingTemplate.convertAndSend("/topic/game/" + roomId, gameRoom);
    }

    @MessageMapping("/createGameRoom")
    public void createGameRoom(GameRoom newGameRoom) {
        logger.info("Creating new game room for attacker: {} and defender: {}",
                newGameRoom.getAttackerId(), newGameRoom.getDefenderId());
        GameRoom createdRoom = gameRoomService.createGameRoom(newGameRoom.getAttackerId(), newGameRoom.getDefenderId());
        messagingTemplate.convertAndSend("/topic/game/" + createdRoom.getGameId(), createdRoom);
    }

    @MessageMapping("/checkGameStatus")
    public void checkGameStatus(String roomId) {
        logger.info("Checking game status for room: {}", roomId);
        GameRoom gameRoom = gameService.getGameRoomById(roomId)
                .orElseThrow(() -> new GameRoomNotFoundException("Game room not found"));
        GameStatusResponse response = createGameStatusResponse(gameRoom);
        messagingTemplate.convertAndSend("/topic/game/" + roomId + "/status", response);
    }

    private GameStatusResponse createGameStatusResponse(GameRoom room) {
        if ("finished".equals(room.getStatus())) {
            return new GameStatusResponse("finished", "Winner: " + room.getWinner());
        } else {
            return new GameStatusResponse("ongoing", "Game is ongoing.");
        }
    }
}