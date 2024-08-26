package com.sid.chess.gameroom;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document
@Builder
public class GameRoom {
    @Id
    private String id;
    private String gameId;
    private String attackerId; // Player 1
    private String defenderId; // Player 2
    private long moveCount = 0;
    private String[][] gameRoomPiecesCurrentLocation = {
            {"B-P1", "B-P2", "B-P3", "B-H2", "B-H1"}, // Player 2 pieces
            { null,   null,   null,   null,   null},  // Player 1 pieces
            { null,   null,   null,   null,   null},  // Player 1 pieces
            { null,   null,   null,   null,   null},  // Player 1 pieces
            {"A-P1", "A-P2", "A-P3", "A-H2", "A-H1"}, // Player 2 pieces
    };
    private String currentTurn; // Can be "attackerId" or "defenderId"
    private String winner; // ID of the winner, null if the game is ongoing
    private String status = "ongoing"; // Game status: "ongoing", "finished", "draw"
}