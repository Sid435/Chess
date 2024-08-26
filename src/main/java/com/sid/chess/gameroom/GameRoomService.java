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
                        var gameId = createGameRoom(attackerId, defenderId).getGameId();
                        return Optional.of(gameId);
                    }
                    return Optional.empty();
                });
    }

    public GameRoom createGameRoom(String attackerId, String defenderId) {
        var gameId = String.format("%s_%s", attackerId, defenderId);

        GameRoom gameRoom = GameRoom.builder()
                .gameId(gameId)
                .attackerId(attackerId)
                .defenderId(defenderId)
                .currentTurn(attackerId)
                .status("ongoing")
                .build();

        GameRoom gameRoom_2 = GameRoom.builder()
                .gameId(gameId)
                .attackerId(defenderId)
                .defenderId(attackerId)
                .currentTurn(defenderId)
                .status("ongoing")
                .build();

        gameRoomRepository.save(gameRoom);
        gameRoomRepository.save(gameRoom_2);

        return gameRoom;
    }

    public void finishGame(String attackerId, String defenderId){
        Optional<GameRoom> gameRoom = gameRoomRepository.findByAttackerIdAndDefenderId(attackerId, defenderId);
        gameRoom.ifPresent(room -> {
            room.setStatus("finished");
            gameRoomRepository.save(room);
        });
    }
}