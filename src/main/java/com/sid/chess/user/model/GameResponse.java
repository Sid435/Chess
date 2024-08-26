package com.sid.chess.user.model;

import lombok.Data;
import lombok.Value;

@Value
@Data
public class GameResponse {
    String attacker_id;
    String receiver_id;
    boolean accepted;
}
