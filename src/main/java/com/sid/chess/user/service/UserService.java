package com.sid.chess.user.service;


import com.sid.chess.user.model.Status;
import com.sid.chess.user.model.User;
import com.sid.chess.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;

    public User addUser(User user){
        user.setStatus(Status.ONLINE);
        return repository.save(user);
    }

    public User disconnect(User user) {
        var stored = repository.findById(user.getId())
                .orElse(null);
        if (stored != null) {
            stored.setStatus(Status.OFFLINE);
            return repository.save(stored);
        }
        return user;
    }

    public List<User> findConnectedUsers() {
        return repository.findByStatus(Status.ONLINE);
    }
}