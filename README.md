# Turn-Based Chess-Like Game

## Overview

This is a turn-based, chess-like game played on a 5x5 grid, designed for two players. The game features a server-client architecture, utilizing Java WebSockets for the server side and HTML, CSS, and JavaScript for the web-based user interface. Real-time communication is handled via WebSockets, allowing players to take turns and see their opponent’s moves instantly.

## Game Rules

### 1. Game Setup
- The game is played between two players on a 5x5 grid.
- Each player controls a team of 5 characters: Pawns, Hero1, and Hero2.
- Players arrange their characters on their respective starting rows at the beginning of the game.

### 2. Characters and Movement
- **Pawn:** Moves one block in any direction (Left, Right, Forward, or Backward).
  - Move commands: `L` (Left), `R` (Right), `F` (Forward), `B` (Backward).
- **Hero1:** Moves two blocks straight in any direction, killing any opponent's character in its path.
  - Move commands: `L` (Left), `R` (Right), `F` (Forward), `B` (Backward).
- **Hero2:** Moves two blocks diagonally in any direction, killing any opponent's character in its path.
  - Move commands: `FL` (Forward-Left), `FR` (Forward-Right), `BL` (Backward-Left), `BR` (Backward-Right).
- All moves are relative to the player's perspective.
- Move command format:
  - For Pawn and Hero1: `<character_name>:<move>` (e.g., `P1:L`, `H1:F`).
  - For Hero2: `<character_name>:<move>` (e.g., `H2:FL`, `H2:BR`).

### 3. Game Objective
- The objective is to eliminate all of the opponent's characters or achieve a specific game-winning condition as defined in the future.

## Current Features

- **Game Board Initialization**: A 5x5 grid that displays the pieces for both players at their starting positions.
- **Player Turns**: Alternating turns between two players.
- **Piece Movement**: Players can select their pieces and move them according to the rules defined above.
- **WebSocket Integration**: Real-time game state updates between server and clients.
- **User Interface**: Basic UI for showing the board and player turns.

## Project Structure

- **Client (Frontend)**: HTML, CSS, JavaScript
  - `index.html`: The main HTML file containing the structure of the game.
  - `styles.css`: CSS file for basic styling of the game board and elements.
  - `game.js`: JavaScript file containing the logic for game initialization, user interactions, and WebSocket communication.
- **Server (Backend)**: Java with WebSocket API
  - `GameServer.java`: Main server file managing WebSocket connections and handling game logic.
  - `GameRoom.java`: Class representing the state of a game room, including players, the game board, and turns.

## Getting Started

### Prerequisites

- Java Development Kit (JDK) 8 or higher
- WebSocket-compatible browser (e.g., Chrome, Firefox)
- Basic knowledge of HTML, CSS, JavaScript, and Java

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/sid435/Chess.git
   cd Chess
   ```

2. **Run the Server**
   - Navigate to the server directory and compile the Java files:
     ```bash
     docker-compose up -d
     ./mvnw spring-boot:run
     ```
   - The server will start and listen for WebSocket connections.

3. **Run the Client**
   - Open `index.html` in a WebSocket-compatible browser.
   - Connect to the server and start playing.

## Future Improvements

- **Enhanced UI/UX**: Improved design and user interface for a better gaming experience.
- **Additional Features**: Add game-winning conditions, scoring, and more advanced game mechanics.
- **Error Handling**: More robust error handling for WebSocket connections and invalid moves.
- **Mobile Compatibility**: Optimize for mobile devices and touch input.




## Contact

For any questions or issues, please contact [email](siddharthkumar435@gmail.com).

---

This README provides an overview of the game's current state, setup instructions, and future development plans. Feel free to adjust any details specific to your project.