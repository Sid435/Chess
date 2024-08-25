package com.sid.chess.gameroom;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GameRoomService {

    @Autowired
    private final GameRoomRepository gameRoomRepository;

    public Optional<String> getGameRoomId(
            String attackerId,
            String defenderId,
            boolean createGameRoomIfNotExists
    ){
        return gameRoomRepository.findByAttackerIdAndDefenderId(attackerId, defenderId)
                .map(GameRoom::getGameId)
                        .or(()->{
                            if(createGameRoomIfNotExists){
                                var gameId = createGameId(attackerId, defenderId);
                                return Optional.of(gameId);
                            }
                            return Optional.empty();
                        });
    }

    public String createGameId(String attackerId, String defenderId){
        var gameId = String.format("%s_%s", attackerId, defenderId);

        GameRoom attackerGameRoom = GameRoom.builder()
                .gameId(gameId)
                .attackerId(attackerId)
                .defenderId(defenderId)
                .build();

        GameRoom defenderGameRoom = GameRoom.builder()
                .gameId(gameId)
                .attackerId(defenderId)
                .defenderId(attackerId)
                .build();

        gameRoomRepository.save(attackerGameRoom);
        gameRoomRepository.save(defenderGameRoom);

        return gameId;
    }

    public void finishGame(String attackerId, String defenderId){
        Optional<GameRoom> attackerGameRomm = gameRoomRepository.findByAttackerIdAndDefenderId(attackerId, defenderId);
        Optional<GameRoom> defenderGameRomm = gameRoomRepository.findByAttackerIdAndDefenderId(defenderId, attackerId);
        attackerGameRomm.ifPresent(gameRoomRepository::delete);
        defenderGameRomm.ifPresent(gameRoomRepository::delete);
    }
}
