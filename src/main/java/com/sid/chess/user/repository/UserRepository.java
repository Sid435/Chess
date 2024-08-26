package com.sid.chess.user.repository;


import com.sid.chess.user.model.Status;
import com.sid.chess.user.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    @Query("{'status' : ?0}")
    List<User> findByStatus(Status status);
}