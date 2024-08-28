package com.sid.chess.gameroom.repository;

import com.sid.chess.gameroom.model.GameRoom;
import com.sid.chess.gameroom.model.GameStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRoomRepository extends MongoRepository<GameRoom, String> {

    @Query("{'attacker_id' : ?0 , 'defender_id' : ?1}")
    Optional<GameRoom> findByAttackerIdAndDefenderId(String att_id, String def_id);

    @Query("{'id' : ?0}")
    Optional<GameRoom> findByGameRoomId(String game_id);

    @Query("{'status' : ?0}")
   List<GameRoom> getGameByStatus(String gameStatus);
}
