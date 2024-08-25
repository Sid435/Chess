document.addEventListener("DOMContentLoaded", () => {
    const socket = new WebSocket("ws://localhost:8080/game");

    socket.onopen = () => {
        console.log("Connected to the WebSocket server");
    };

    socket.onmessage = (event) => {
        console.log("Received:", event.data);

        // Update the game board based on the new game state
        // Example: Update UI logic here
    };

    socket.onclose = () => {
        console.log("Disconnected from the WebSocket server");
    };

    // Example of sending a move command
    function sendMove(character, move) {
        const message = `${character}:${move}`;
        socket.send(message);
    }

    // Add event listeners for game interactions
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            // Example: Handle cell click
            // sendMove('P1', 'L'); // Example move
        });
    });
});