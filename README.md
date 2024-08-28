
# Turn-Based Chess-Like Game

## Overview

This is a turn-based, chess-like game played on a 5x5 grid, designed for two players. The game features a server-client architecture, utilizing Java WebSockets for the server side and HTML, CSS, and JavaScript for the web-based user interface. Real-time communication is handled via WebSockets, allowing players to take turns and see their opponent’s moves instantly.

## Game Rules

### 1. Game Setup
- The game is played between two players on a 5x5 grid.
- Each player controls a team of 5 characters: Pawns, Hero1, Hero2, and Hero3.
- Players arrange their characters on their respective starting rows at the beginning of the game.

### 2. Characters and Movement
- **Pawn:** Moves one block in any direction (Left, Right, Forward, or Backward).
- **Hero1:** Moves two blocks straight in any direction, eliminating any opponent's character in its path.
- **Hero2:** Moves two blocks diagonally in any direction, eliminating any opponent's character in its path.
- **Hero3:** Moves two squares in one direction and then one square perpendicular to that direction.
- All moves are relative to the player's perspective.

### 3. Game Objective
- The objective is to eliminate all of the opponent's characters or achieve a specific game-winning condition as defined in the future.

## Current Features

- **Game Board Initialization**: A 5x5 grid that displays the pieces for both players at their starting positions.
- **Player Turns**: Alternating turns between two players.
- **Piece Movement**: Players can select their pieces and move them according to the rules defined above.
- **WebSocket Integration**: Real-time game state updates between server and clients.
- **User Interface**: Basic UI for showing the board and player turns.
- **Spectator Mode**: Allows users to watch ongoing games in real-time without interacting with the game board.

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

- Java Development Kit (JDK) 17 or higher
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
      ./mvnw spring-boot:run
      ```
    - The server will start and listen for WebSocket connections.

3. **Run the Client**
    - Open `index.html` in a WebSocket-compatible browser.
    - locate `index.html` at :- Chess/src.main/resources/static
    - Connect to the server and start playing.

## Spectator Mode

### Overview

The spectator mode allows users to watch ongoing games in real-time without actively participating or interacting with the game board. This feature is ideal for players who want to observe strategies or simply enjoy watching the game unfold.

### Implementation Details

- **Joining as a Spectator**:
    - Users can join any ongoing game by clicking on a match from the list of current matches displayed on the main screen.
    - Upon selecting a match, the user is redirected to the game board with spectator mode activated.

- **Game Board for Spectators**:
    - The game board is rendered without allowing user interactions, ensuring spectators can only observe the moves made by the players.
    - Spectators receive real-time updates of the game state via WebSocket, similar to active players.

- **User Interface Adjustments**:
    - A visual indication (like a semi-transparent overlay or disabled state) is applied to the game board to indicate that the user is in spectator mode.
    - Controls and actions specific to players, such as making moves or sending messages, are disabled.

### How to Spectate

1. **Access the Game List**:
    - After logging in, users will see a list of ongoing games under the "Current Matches" section.

2. **Select a Game to Watch**:
    - Click on any game listed. This action will trigger a redirection to the game board in spectator mode.

3. **Viewing the Game**:
    - As a spectator, you will see all the moves made by the players in real-time without the ability to interact with the game board.

### Example Code

To enable spectator mode, use the following in `game.js`:

```javascript
function watchGameRequest(roomId) {
    window.location.href = `game.html?roomId=${roomId}&spectate=true`;
}

function disableGameBoardInteractions() {
    document.getElementById('game-board').classList.add('spectate-mode');
    console.log('Spectate mode activated: Board interactions disabled');
}
```

In `game.html`, check the URL for the `spectate` parameter to apply the spectator mode:

```javascript
window.onload = function () {
    connectWebSocket();
    const urlParams = new URLSearchParams(window.location.search);
    const spectate = urlParams.get('spectate');

    if (spectate === 'true') {
        disableGameBoardInteractions();
    }
};
```

## UI/UX Workflow

### 1. **Login and Dashboard**
- **Login**: Users enter their username to log in. Successful login redirects them to the dashboard.
- **Dashboard**: Displays "Active Users" and "Ongoing Matches" in a grid layout, updating dynamically via WebSocket.

### 2. **Challenging an Opponent**
- **Challenge Action**: Users click on an active user to send a game challenge. Confirmation is shown via modal.
- **Receiving Challenges**: Users receive a challenge notification with options to "Accept" or "Decline".

### 3. **Game Board - Active Player Mode**
- **Game Board Display**: Shows a 5x5 grid with pieces; highlights current player’s turn.
- **Piece Movement**: Users select pieces and see possible moves highlighted. Moves are sent via WebSocket.

### 4. **Game Board - Spectator Mode**
- **Spectating**: Users click on ongoing matches to view as spectators. Game board is shown in a non-interactive mode, updating in real-time.

### 5. **Game Conclusion**
- **End Game**: Displays game results and disables the board. All users receive the final game state update.

## Future Improvements

- **Enhanced UI/UX**: Improved design and user interface for a better gaming experience.
- **Error Handling**: More robust error handling for WebSocket connections and invalid moves.
- **Mobile Compatibility**: Optimize for mobile devices and touch input.

## Contact

For any questions or issues, please contact [email](mailto:siddharthkumar435@gmail.com).
