package com.sid.chess.user.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameResponse {
    String attacker_id;
    String defender_id;
    boolean accepted;
}
