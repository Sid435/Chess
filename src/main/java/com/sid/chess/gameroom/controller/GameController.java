package com.sid.chess.gameroom.controller;


import com.sid.chess.gameroom.model.GameRoom;
import com.sid.chess.gameroom.model.GameStatus;
import com.sid.chess.gameroom.model.Move;
import com.sid.chess.gameroom.service.GameRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class GameController {
    private final GameRoomService service;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/move")
    public void makeMove(@Payload Move move){
        GameRoom room = service.processMove(move);
        messagingTemplate.convertAndSend("/topic/game/" + room.getId(), room);
    }

    @MessageMapping("/create_game_room")
    public void createGameRoom(@Payload GameRoom room){
        GameRoom gameRoom = service.getGameRoom(room.getAttacker_id(), room.getDefender_id(), true);
        messagingTemplate.convertAndSend("/topic/games", gameRoom);
        messagingTemplate.convertAndSend("/topic/game/" + room.getId(), gameRoom);
    }

    @MessageMapping("/game_status")
    public void gameStatus(@Payload GameRoom room){
        GameRoom gameRoom = service.getGameRoomById(room.getAttacker_id(), room.getDefender_id(), false);
        messagingTemplate.convertAndSend("/topic/game/" + gameRoom.getId() + "/status", gameRoom.getStatus());
    }

    @MessageMapping("/get_game_room")
    public void getGameRoom(@Payload GameRoom game){
        GameRoom gameRoom = service.getGameRoomById(game.getId());
        messagingTemplate.convertAndSend("/topic/game/" + gameRoom.getId(), gameRoom);
    }

    @GetMapping("/current_matches")
    public ResponseEntity<List<GameRoom>> currentMatches(){
        return ResponseEntity.ok(service.findGameByStatus(GameStatus.ONGOING));
    }

    @DeleteMapping("/finish_game")
    public void deleteGame(GameRoom gameRoom){
        service.finishGame(gameRoom.getId());
    }

    @GetMapping("/ping")
    public ResponseEntity<String> testMapp(){
        System.out.println("this");
        return ResponseEntity.ok("pong");
    }

}
