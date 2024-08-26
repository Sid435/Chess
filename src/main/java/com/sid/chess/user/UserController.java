package com.sid.chess.user;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342")
public class UserController {
    @Autowired
    private final UserService service;

    @MessageMapping("/user/addUser")
    @SendTo("/topic/users")
    public User addUser(@Payload User user) {
        return service.saveUser(user);
    }

    @MessageMapping("/user/disconnectUser")
    @SendTo("/topic/users")
    public User disconnectUser(@Payload User user) {
        return service.disconnect(user);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> findConnectedUsers() {
        return ResponseEntity.ok(service.findConnectedUsers());
    }
}