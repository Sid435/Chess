package com.sid.chess.gameroom.model;

import lombok.Value;

@Value
public class Move {
    String game_room_id;
    String piece_type;
    String attacker_id;
    String defender_id;
    int fromX;
    int fromY;
    int toX;
    int toY;

}
