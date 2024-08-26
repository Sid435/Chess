package com.sid.chess.game;

import lombok.Value;

@Value
public class Move {
    int fromX;
    int fromY;
    int toX;
    int toY;

    public boolean isWithinBounds(int maxX, int maxY) {
        return fromX >= 0 && fromX < maxX && fromY >= 0 && fromY < maxY &&
                toX >= 0 && toX < maxX && toY >= 0 && toY < maxY;
    }
}