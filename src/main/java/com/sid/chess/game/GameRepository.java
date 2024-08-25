package com.sid.chess.game;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface GameRepository extends MongoRepository<GameMoves, String> {
    @Query("{ 'gameId' : ?0 }")
    List<GameMoves> findByGameId(String id);
}
