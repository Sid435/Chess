let stompClient = null;
let currentUser = localStorage.getItem('username');

function connectWebSocket() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect(
        { username: localStorage.getItem('username') },
        function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/user', function (response) {
                console.log('Received user update:', response.body);
                updateUserList();
            });
            stompClient.subscribe(`/user/${currentUser}/queue/challenge`, function(message) {
                console.log('Received challenge:', message.body);
                const challenge = JSON.parse(message.body);
                if(confirm(challenge.message)) {
                    acceptChallenge(challenge.attacker_id);
                } else {
                    declineChallenge(challenge.attacker_id);
                }
            });

            stompClient.subscribe('/user/queue/response', function(message) {
                console.log('Received game response:', message.body);
                const response = JSON.parse(message.body);
                if (response.accepted) {
                    alert(`${response.defender_id} accepted your challenge!`);
                    // Add logic here to start the game or redirect to game page
                } else {
                    alert(`${response.defender_id} declined your challenge.`);
                }
            });
            registerUser();
        },
        function (error) {
            console.error('Error connecting to WebSocket:', error);
        }
    );
}
function registerUser() {
    const userName = localStorage.getItem('username');
    if (userName) {
        currentUser = { name: userName };
        stompClient.send('/app/addUser', {}, JSON.stringify(currentUser));
        document.querySelector('h1').textContent = `Welcome, ${userName}!`;
        updateUserList();
    } else {
        window.location.href = 'index.html';
    }
}

function acceptChallenge(attackerId) {
    const gameResponse = {
        attacker_id: attackerId,
        defender_id: currentUser.name,
        accepted: true
    };
    stompClient.send("/app/game_response", {}, JSON.stringify(gameResponse));
    alert(`You accepted the challenge from ${attackerId}`);
    // Add logic here to start the game or redirect to game page
}

function declineChallenge(attackerId) {
    const gameResponse = {
        attacker_id: attackerId,
        defender_id: currentUser.name,
        accepted: false
    };
    stompClient.send("/app/game_response", {}, JSON.stringify(gameResponse));
    alert(`You declined the challenge from ${attackerId}`);
}

function updateUserList() {
    fetch('http://localhost:8080/users')
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('user-list');
            userList.innerHTML = '';

            users.forEach(user => {
                if (user.name !== currentUser.name) {
                    const userElement = document.createElement('div');
                    userElement.classList.add('user-item');
                    userElement.textContent = user.name;
                    userElement.onclick = () => sendGameRequest(user.name);
                    userList.appendChild(userElement);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}

function sendGameRequest(defenderId) {
    const gameRequest = {
        attacker_id: currentUser.name,
        defender_id: defenderId,
        message: `${currentUser.name} wants to play with you!`
    };
    stompClient.send("/app/game_request", {}, JSON.stringify(gameRequest));
    alert(`Game request sent to ${defenderId}`);
}

window.onload = connectWebSocket;

window.onbeforeunload = function() {
    if (stompClient !== null && currentUser !== null) {
        stompClient.send("/app/disconnect", {}, JSON.stringify(currentUser));
    }
};