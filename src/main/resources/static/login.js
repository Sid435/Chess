document.getElementById('login-btn').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    if (username) {
        console.log(username);
        // Send username to server
        fetch('http://localhost:8080/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: username }),
        })
        .then(response => response.json())
        .then(user => {
            // Store user information locally
            localStorage.setItem('id', JSON.stringify(user));

            // Connect to WebSocket server
            const socket = new WebSocket('http://localhost:8080/ws');

            socket.onopen = function(event) {
                console.log("Connected to WebSocket");
                // Notify the server that this user has joined
                socket.send(JSON.stringify({ type: 'JOIN', username: user.name }));

                // Redirect to lobby page
                window.location.href = 'lobby.html';
            };

            socket.onerror = function(error) {
                console.error('WebSocket Error:', error);
                alert('Failed to connect to WebSocket. Please try again.');
            };

            socket.onclose = function() {
                console.log('WebSocket connection closed');
            };
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to log in. Please try again.');
        });
    } else {
        alert('Please enter a username.');
    }
});