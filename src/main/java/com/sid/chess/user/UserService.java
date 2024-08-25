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
    public void saveUser(User user){ // Getting all the info of the user from the payload then making the user status "ONLINE"
        user.setStatus(Status.ONLINE);
        repository.save(user);
    }

    public void disconnect(User user){ // Getting the user by ID and then updating the status of the user to "OFFLINE"
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
