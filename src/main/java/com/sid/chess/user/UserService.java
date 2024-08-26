package com.sid.chess.user;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    private final UserRepository repository;

    public User saveUser(User user) {
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
        List<User> a =  repository.findByStatus(Status.ONLINE);
        System.out.println(a);
        return a;
    }
}