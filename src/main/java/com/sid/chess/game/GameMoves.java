package com.sid.chess.game;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class GameMoves {

    @Id
    private String id;
    private String gameId;
    private String attackerId;
    private String defenderId;
    private int[][] currentState;
    private int[] move;
    private long move_number;
    private Date timestamp;
}
