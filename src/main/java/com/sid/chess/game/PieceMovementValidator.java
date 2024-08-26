package com.sid.chess.game;

public class PieceMovementValidator {

    public static boolean isValidMove(String piece, Move move) {
        if(piece.toLowerCase().endsWith("p1")
                || piece.toLowerCase().endsWith("p2")
                || piece.toLowerCase().endsWith("p3")){
            return isPawnMove(move);
        }
        else if(piece.toLowerCase().endsWith("h1")){
            return isHero1Move(move);
        }
        else if(piece.toLowerCase().endsWith("h2")){
            return isHero2Move(move);
        }else return false;
    }

    private static boolean isPawnMove(Move move) {
        int dx = Math.abs(move.getToX() - move.getFromX());
        int dy = Math.abs(move.getToY() - move.getFromY());
        return dx + dy == 1;
    }

    private static boolean isHero1Move(Move move) {
        int dx = Math.abs(move.getToX() - move.getFromX());
        int dy = Math.abs(move.getToY() - move.getFromY());
        return (dx == 2 && dy == 0) || (dx == 0 && dy == 2);
    }

    private static boolean isHero2Move(Move move) {
        int dx = Math.abs(move.getToX() - move.getFromX());
        int dy = Math.abs(move.getToY() - move.getFromY());
        return dx == 2 && dy == 2;
    }
}