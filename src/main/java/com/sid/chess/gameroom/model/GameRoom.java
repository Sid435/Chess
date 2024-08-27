package com.sid.chess.gameroom.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class GameRoom {
    @Id
    private String id;
    private String attacker_id;
    private String defender_id;
    @Builder.Default
    private List<Move> move_history = new ArrayList<>();
    private String current_id;
    private String winner;

    @Builder.Default 
    private GameStatus status = GameStatus.ONGOING;

    @Builder.Default
    private String[][] current_game = {
            {"B-P1", "B-P2", "B-P3", "B-H2", "B-H1"}, // Player 2 pieces
            { null,   null,   null,   null,   null},  // Player 1 pieces
            { null,   null,   null,   null,   null},  // Player 1 pieces
            { null,   null,   null,   null,   null},  // Player 1 pieces
            {"A-P1", "A-P2", "A-P3", "A-H2", "A-H1"}, // Player 2 pieces
    };

}
