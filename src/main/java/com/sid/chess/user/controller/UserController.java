package com.sid.chess.user.controller;


import com.sid.chess.user.model.GameRequest;
import com.sid.chess.user.model.GameResponse;
import com.sid.chess.user.model.User;
import com.sid.chess.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;


import java.util.List;

@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    public final UserService service;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/game_request")
    public void sendGameRequest(@Payload GameRequest gameRequest) {
        simpMessagingTemplate.convertAndSendToUser(
                gameRequest.getDefender_id(),
                "/queue/challenge",
                GameRequest.builder()
                        .attacker_id(gameRequest.getAttacker_id())
                        .defender_id(gameRequest.getDefender_id())
                        .message(gameRequest.getMessage()).build()
        );
    }


    @MessageMapping("/game_response")
    public void handleGameResponse(@Payload GameResponse gameResponse) {
        simpMessagingTemplate.convertAndSendToUser(
                gameResponse.getAttacker_id(),
                "/queue/response",
                gameResponse
        );
    }

    @MessageMapping("/addUser")
    @SendTo("/topic/user")
    public ResponseEntity<User> postUser(@Payload User user){
        return ResponseEntity.ok(service.addUser(user));
    }

    @MessageMapping("/disconnect")
    @SendTo("/topic/user")
    public ResponseEntity<User> disconnectUser(@Payload User user){
        return ResponseEntity.ok(service.disconnect(user));
    }
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(){
        return ResponseEntity.ok(service.findConnectedUsers());
    }
}