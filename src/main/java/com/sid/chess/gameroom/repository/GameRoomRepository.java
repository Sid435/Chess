package com.sid.chess.gameroom.repository;

import com.sid.chess.gameroom.model.GameRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameRoomRepository extends MongoRepository<GameRoom, String> {

    @Query("{'attackerId' : ?0 , 'defenderId' : ?1}")
    Optional<GameRoom> findByAttackerIdAndDefenderId(String att_id, String def_id);

    @Query("{'id' : ?0}")
    Optional<GameRoom> findByGameRoomId(String game_id);

}
