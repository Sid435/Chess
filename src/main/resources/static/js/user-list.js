let stompClient = null;
let currentUser = null;

function connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        registerUser();
        fetchActiveUsers();
        subscribeToPersonalQueue();
    });
}

function registerUser() {
    const userName = localStorage.getItem('username');
    if (userName) {
        currentUser = { id: Date.now().toString(), fullName: userName, status: 'ONLINE' };
        stompClient.send("/app/user/addUser", {}, JSON.stringify(currentUser));
    } else {
        window.location.href = 'index.html';
    }
}

function fetchActiveUsers() {
    fetch('http://localhost:8080/users')
        .then(response => response.json())
        .then(users => updateUserList(users))
        .catch(error => console.error('Error fetching users:', error));
}

function updateUserList(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    users.forEach(user => {
        if (user.id !== currentUser.id) {
            const userElement = document.createElement('div');
            userElement.classList.add('user-item');
            userElement.textContent = user.fullName;
            userElement.onclick = () => sendGameRequest(user.id);
            userList.appendChild(userElement);
        }
    });
}

function sendGameRequest(opponentId) {
    stompClient.send("/app/gameRequest", {}, JSON.stringify({
        senderId: currentUser.id,
        receiverId: opponentId
    }));
}

function subscribeToPersonalQueue() {
    stompClient.subscribe('/user/queue/gameRequest', function(message) {
        const request = JSON.parse(message.body);
        if (confirm(`${request.senderName} has invited you to play. Accept?`)) {
            acceptGameRequest(request);
        } else {
            declineGameRequest(request);
        }
    });

    stompClient.subscribe('/user/queue/gameResponse', function(message) {
        alert(message.body);
    });
}

function acceptGameRequest(request) {
    stompClient.send("/app/gameResponse", {}, JSON.stringify({
        senderId: request.senderId,
        receiverId: currentUser.id,
        accepted: true
    }));
    startGame(request.senderId, currentUser.id);
}

function declineGameRequest(request) {
    stompClient.send("/app/gameResponse", {}, JSON.stringify({
        senderId: request.senderId,
        receiverId: currentUser.id,
        accepted: false
    }));
}

function startGame(player1Id, player2Id) {
    localStorage.setItem('gameRoomId', `${player1Id}_${player2Id}`);
    window.location.href = 'game.html';
}

window.onload = connect;

window.onbeforeunload = function() {
    if (stompClient !== null && currentUser !== null) {
        stompClient.send("/app/user/disconnectUser", {}, JSON.stringify(currentUser));
    }
};