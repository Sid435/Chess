package com.sid.chess.custom_exceptions;

public class GameRoomCreationException extends RuntimeException {
    public GameRoomCreationException(String message) {
        super(message);
    }
}

