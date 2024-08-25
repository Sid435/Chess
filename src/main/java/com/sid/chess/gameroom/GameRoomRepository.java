package com.sid.chess.gameroom;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameRoomRepository  extends MongoRepository<GameRoom, String> {
    @Query("{'attackerId' : ?0 , 'defenderId' : ?1}")
    Optional<GameRoom> findByAttackerIdAndDefenderId(String attackerId, String defenderId);

    @Query("{'id' : ?0}")
    Optional<GameRoom> findGameRoomById(String roomId);
}
