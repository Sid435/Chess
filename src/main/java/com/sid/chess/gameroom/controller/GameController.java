package com.sid.chess.gameroom.controller;


import com.sid.chess.gameroom.model.GameRoom;
import com.sid.chess.gameroom.model.Move;
import com.sid.chess.gameroom.service.GameRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

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
        messagingTemplate.convertAndSend("/topic/game/" + room.getId(), gameRoom);
    }

    @MessageMapping("/game_status")
    public void gameStatus(@Payload GameRoom room){
        GameRoom gameRoom = service.getGameRoomById(room.getAttacker_id(), room.getDefender_id(), false);
        messagingTemplate.convertAndSend("/topic/game/" + gameRoom.getId() + "/status", gameRoom.getStatus());
    }

    @MessageMapping("/get_game_room")
    public void getGameRoom(@Payload String room_id){
        GameRoom gameRoom = service.getGameRoomById(room_id);
        messagingTemplate.convertAndSend("/topic/game/" + room_id, gameRoom);
    }

}
