package com.sid.chess.custom_exceptions;
import java.lang.*;
public class IllegalMoveException extends RuntimeException {
    public IllegalMoveException(String message) {
        super(message);
    }
}