package com.sid.chess.user.model;

import lombok.Data;
import lombok.Value;

@Value
@Data
public class GameRequest {
    String attacker_id;
    String defender_id;
    String message;
}
