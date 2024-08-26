let stompClient = null;
let currentUser = null;

function connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/users', function (message) {
            updateUserList(JSON.parse(message.body));
        });
        registerUser();
        fetchActiveUsers(); // Move this here to ensure connection is established
    });
}

function registerUser() {
    const userName = localStorage.getItem('username');
    if (userName) {
        currentUser = { id: Date.now().toString(), fullName: userName, status: 'ONLINE' };
        stompClient.send("/app/user/addUser", {}, JSON.stringify(currentUser));
        document.querySelector('h1').textContent = `Welcome, ${userName}!`;
        fetchActiveUsers();
    } else {
        window.location.href = 'index.html';
    }
}

function fetchActiveUsers() {
    fetch('http://localhost:8080/users')
        .then(response => response.json())
        .then(users => {
            updateUserList(users);
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            // Optionally display an error message to the user
        });
}

function updateUserList(users) {
    console.log('Updating user list with:', users);
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    const userArray = Array.isArray(users) ? users : [users];

    userArray.forEach(user => {
        if (user.id !== currentUser.id) {
            const userElement = document.createElement('div');
            userElement.classList.add('user-item');
            userElement.textContent = user.fullName;
            userElement.onclick = () => startGame(user.id);
            userList.appendChild(userElement);
        }
    });
}

function startGame(opponentId) {
    stompClient.send("/app/createGameRoom", {}, JSON.stringify({
        attackerId: currentUser.id,
        defenderId: opponentId
    }));
    localStorage.setItem('gameRoomId', `${currentUser.id}_${opponentId}`);
    window.location.href = 'game.html';
}

window.onload = connect;

window.onbeforeunload = function() {
    if (stompClient !== null && currentUser !== null) {
        stompClient.send("/app/user/disconnectUser", {}, JSON.stringify(currentUser));
    }
};