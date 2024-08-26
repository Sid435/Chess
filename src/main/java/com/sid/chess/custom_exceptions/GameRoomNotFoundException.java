package com.sid.chess.custom_exceptions;

public class GameRoomNotFoundException extends RuntimeException {
    public GameRoomNotFoundException(String message) {
        super(message);
    }
}