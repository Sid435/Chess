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
    private int[][] gameRoomPiecesCurrentLocation = {
            {-1, -2, -3, -4, -5}, // Player 2 pieces
            { 0,  0,  0,  0,  0}, // Empty rows
            { 0,  0,  0,  0,  0},
            { 0,  0,  0,  0,  0},
            { 1,  2,  3,  4,  5}  // Player 1 pieces
    };
    private String currentTurn; // Can be "attackerId" or "defenderId"
    private String winner; // ID of the winner, null if the game is ongoing
    private String status = "ongoing"; // Game status: "ongoing", "finished", "draw"
}