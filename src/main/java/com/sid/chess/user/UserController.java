package com.sid.chess.user;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserController {
    @Autowired
    private final UserService service;

    /*
     * Message Mapping maps message from a client to a specific handler methods on the server
     * It is similar to how RequestMapping maps HTTP request to handler methods in a REST controller */

    @MessageMapping("/user.addUser") // the request with the given url will be processed by the following method
    @SendTo("/user/public") // once the request is processed by the method, the resulting value is sent to the given URL.
    public User addUser(
            @Payload User user
    ){
        service.saveUser(user);
        return user;
    }

    @MessageMapping("/user.disconnectUser")
    @SendTo("/user/public")
    public User disconnectUser(
            @Payload User user
    ){
        service.disconnect(user);
        return user;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> findConnectedUsers(){
        return ResponseEntity.ok(service.findConnectedUsers());
    }

}
