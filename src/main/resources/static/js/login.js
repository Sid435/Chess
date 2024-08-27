let stompClient = null;

function connectWebSocket() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/user', function (response) {
            const user = JSON.parse(response.body);
            updateStatus(`User ${user.name} is now ${user.status}`);
        });
    }, function (error) {
        console.error('Error connecting to WebSocket:', error);
        updateStatus('Failed to connect to the server. Please try again.');
    });
}

function login(username) {
    const user = { name: username };
    stompClient.send("/app/addUser", {}, JSON.stringify(user));
    localStorage.setItem('username', username);
    updateStatus('Login successful. Redirecting...');
    setTimeout(() => {
        window.location.href = 'user-list.html';
    }, 1500);
}

function updateStatus(message) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    if (username) {
        login(username);
    }
});

// Connect to WebSocket when the page loads
connectWebSocket();