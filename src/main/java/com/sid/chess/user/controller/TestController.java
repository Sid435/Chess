package com.sid.chess.user.controller;

import com.sid.chess.user.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {
    @GetMapping("/ping")
    public ResponseEntity<User> testMapp(){
        System.out.println("this");
        User u = new User();
        u.setName("some");
        return ResponseEntity.ok(u);
    }
}
