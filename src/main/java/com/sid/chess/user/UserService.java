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
    public void saveUser(User user){
        user.setStatus(Status.ONLINE);
        repository.save(user);
    }

    public void disconnect(User user){
        var stored = repository.findById(user.getId())
                .orElse(null);
        if(stored!= null){
            stored.setStatus(Status.OFFLINE);
            repository.save(stored);
        }

    }
    public List<User> findConnectedUsers(){ // finding all the users whose status is "ONLINE"
        return repository.findByStatus(Status.ONLINE);
    }
}
